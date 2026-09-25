# silver.preco_competidores -- precos de concorrentes, chave id_produto + nome_concorrente.
#
# POR QUE materialized view com leitura batch:
#   A bronze e sobrescrita a cada execucao; streaming table exigiria fonte append-only.
#
# POR QUE a chave e composta:
#   O mesmo produto e cotado em varios concorrentes. A unidade de observacao e "o preco deste
#   concorrente para este produto" -- so o par identifica a linha. Deduplicar so por
#   id_produto jogaria fora concorrentes legitimos.
#
# POR QUE converter data_coleta de texto para timestamp:
#   Na bronze ela chega como string ("2026-01-11 00:05:16"). Como texto, qualquer filtro ou
#   ordenacao por data vira comparacao lexicografica, que so funciona por acidente do formato.
#   try_to_timestamp converte e devolve NULL no que nao for data, em vez de derrubar o
#   pipeline -- queremos MEDIR o problema, nao esconder a linha.
#
# POR QUE preco_suspeito e uma coluna marcada e nao um filtro:
#   Concorrente abaixo de 60% do nosso preco quase sempre e erro de coleta (unidade errada,
#   promocao relampago, produto diferente com nome parecido). Mas "quase sempre" nao e
#   "sempre": pode ser concorrencia real e agressiva, e essa e justamente a informacao mais
#   valiosa da tabela. Descartar a linha apagaria o sinal. Marcamos e medimos.
#
# POR QUE preco_plausivel e warn (@dp.expect) e nao fail:
#   Ele mede quantas linhas estao suspeitas a cada execucao. Se o numero disparar, alguem
#   olha. Se fosse fail, a primeira coleta estranha derrubaria a atualizacao inteira.

from pyspark import pipelines as dp
from pyspark.sql import Window
from pyspark.sql import functions as F

# Abaixo deste percentual do nosso preco, a cotacao do concorrente e considerada suspeita.
LIMITE_PRECO_SUSPEITO = 0.6


@dp.materialized_view(
    name="silver.preco_competidores",
    comment=(
        "Precos de concorrentes deduplicados por id_produto + nome_concorrente, "
        "com data_coleta em timestamp e marcacao de preco suspeito."
    ),
)
@dp.expect_all_or_fail(
    {
        "id_produto_preenchido": "id_produto IS NOT NULL AND trim(id_produto) <> ''",
        "preco_concorrente_positivo": "preco_concorrente > 0",
    }
)
@dp.expect("preco_plausivel", "NOT preco_suspeito")
def silver_preco_competidores():
    bronze = spark.read.table("bronze.preco_competidores")
    produtos = spark.read.table("silver.produtos").select("id_produto", "preco_atual")

    data_coleta = F.expr("try_to_timestamp(data_coleta)")

    janela = Window.partitionBy("id_produto", "nome_concorrente").orderBy(
        data_coleta.desc_nulls_last(), F.col("preco_concorrente").asc_nulls_last()
    )

    deduplicado = (
        bronze.withColumn("_ordem", F.row_number().over(janela))
        .filter(F.col("_ordem") == 1)
        .drop("_ordem")
        .withColumn("data_coleta", data_coleta)
        .withColumn(
            "preco_concorrente",
            F.col("preco_concorrente").cast("decimal(10,2)"),
        )
    )

    # Join a esquerda: se um dia aparecer cotacao de produto que nao esta no catalogo, a linha
    # continua na tabela (nao perdemos a coleta). Sem preco_atual nao da para julgar o preco,
    # entao preco_suspeito fica false -- "nao sabemos", e nao "e suspeito".
    return (
        deduplicado.join(produtos, on="id_produto", how="left")
        .select(
            F.col("id_produto"),
            F.col("nome_concorrente"),
            F.col("preco_concorrente"),
            F.col("preco_atual"),
            F.col("data_coleta"),
            F.coalesce(
                F.col("preco_concorrente") < F.lit(LIMITE_PRECO_SUSPEITO) * F.col("preco_atual"),
                F.lit(False),
            ).alias("preco_suspeito"),
        )
    )
