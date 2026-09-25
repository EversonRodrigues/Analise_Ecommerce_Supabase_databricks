# silver.vendas -- fato de vendas limpo e enriquecido, chave id_venda.
#
# POR QUE materialized view com leitura batch:
#   A bronze e sobrescrita a cada execucao da ingestao. Uma streaming table precisaria de uma
#   fonte append-only; aqui a fonte inteira e reescrita, entao recalcular tudo e o correto.
#
# POR QUE receita e DECIMAL(10,2) e nao double:
#   Esta e a coluna que o negocio confere. Em double, somar milhares de linhas acumula erro de
#   ponto flutuante e o total fecha com centavos de diferenca do esperado. DECIMAL e exato.
#   O cast de preco_unitario acontece ANTES da multiplicacao, para que o produto ja nasca exato.
#
# POR QUE NUNCA descartamos linha aqui (nada de expect_or_drop):
#   Venda e dinheiro. Apagar uma venda de produto nao cadastrado tiraria R$ do faturamento e a
#   gold passaria a mentir sobre a receita. O problema conhecido vira COLUNA (produto_cadastrado,
#   venda_antes_do_cadastro) e e MEDIDO por @dp.expect (warn). Quem analisa decide se filtra.
#
# POR QUE o par de warns e invertido (produto_cadastrado / venda_depois_do_cadastro):
#   @dp.expect conta as linhas que SATISFAZEM a condicao; o que queremos medir e o problema.
#   Entao a expectation afirma o estado saudavel e as linhas "falhas" nas metricas sao
#   exatamente as vendas problematicas. Por isso venda_depois_do_cadastro = NOT
#   venda_antes_do_cadastro.
#
# POR QUE canal_venda e fail e nao warn:
#   O canal alimenta a segmentacao de toda a gold. Um valor novo (ou nulo) nao e ruido, e
#   mudanca de contrato da origem -- alguem precisa olhar antes de publicarmos numero errado.

from pyspark import pipelines as dp
from pyspark.sql import Window
from pyspark.sql import functions as F

# dayofweek do Spark ja devolve 1 = domingo ... 7 = sabado, que e a convencao pedida.
# Este mapa so traduz o numero para o nome em portugues.
DIAS_DA_SEMANA = {
    1: "Domingo",
    2: "Segunda",
    3: "Terça",
    4: "Quarta",
    5: "Quinta",
    6: "Sexta",
    7: "Sábado",
}

CANAIS_VALIDOS = ("ecommerce", "loja_fisica")


def _mapa_dia_semana():
    pares = []
    for numero, nome in DIAS_DA_SEMANA.items():
        pares.append(F.lit(numero))
        pares.append(F.lit(nome))
    return F.create_map(*pares)


@dp.materialized_view(
    name="silver.vendas",
    comment=(
        "Vendas deduplicadas por id_venda, com receita em DECIMAL(10,2), atributos de "
        "calendario e marcacao dos problemas de cadastro de produto."
    ),
)
@dp.expect_all_or_fail(
    {
        "id_venda_preenchido": "id_venda IS NOT NULL AND trim(id_venda) <> ''",
        "data_venda_preenchida": "data_venda IS NOT NULL",
        "id_cliente_preenchido": "id_cliente IS NOT NULL AND trim(id_cliente) <> ''",
        "id_produto_preenchido": "id_produto IS NOT NULL AND trim(id_produto) <> ''",
        "quantidade_preenchida": "quantidade IS NOT NULL",
        "quantidade_positiva": "quantidade > 0",
        "preco_unitario_preenchido": "preco_unitario IS NOT NULL",
        "preco_unitario_positivo": "preco_unitario > 0",
        "canal_venda_conhecido": "canal_venda IN ('ecommerce', 'loja_fisica')",
    }
)
@dp.expect_all(
    {
        "produto_cadastrado": "produto_cadastrado",
        "venda_depois_do_cadastro": "NOT venda_antes_do_cadastro",
    }
)
def silver_vendas():
    bronze = spark.read.table("bronze.vendas")
    produtos = spark.read.table("silver.produtos").select("id_produto", "data_criacao")

    janela = Window.partitionBy("id_venda").orderBy(
        F.col("data_venda").desc_nulls_last(), F.col("preco_unitario").desc_nulls_last()
    )

    deduplicado = (
        bronze.withColumn("_ordem", F.row_number().over(janela))
        .filter(F.col("_ordem") == 1)
        .drop("_ordem")
        .withColumn("preco_unitario", F.col("preco_unitario").cast("decimal(10,2)"))
    )

    # Join a esquerda de proposito: a venda de produto fora do catalogo PRECISA sobreviver.
    # data_criacao nula depois do join e justamente o sinal de "produto nao cadastrado".
    return (
        deduplicado.join(produtos, on="id_produto", how="left")
        .select(
            F.col("id_venda"),
            F.col("data_venda"),
            F.col("id_cliente"),
            F.col("id_produto"),
            F.col("canal_venda"),
            F.col("quantidade"),
            F.col("preco_unitario"),
            (F.col("quantidade") * F.col("preco_unitario"))
            .cast("decimal(10,2)")
            .alias("receita"),
            F.to_date(F.col("data_venda")).alias("data"),
            F.hour(F.col("data_venda")).alias("hora"),
            F.dayofweek(F.col("data_venda")).alias("dia_semana_num"),
            _mapa_dia_semana()[F.dayofweek(F.col("data_venda"))].alias("dia_semana"),
            F.col("data_criacao").isNotNull().alias("produto_cadastrado"),
            # Produto nao cadastrado nao tem data_criacao para comparar. Nesse caso a resposta
            # e false ("nao sabemos"), nao true -- senao o mesmo problema seria contado duas
            # vezes, em produto_cadastrado e em venda_antes_do_cadastro.
            F.coalesce(
                F.col("data_venda") < F.col("data_criacao"),
                F.lit(False),
            ).alias("venda_antes_do_cadastro"),
        )
    )
