# silver.produtos -- catalogo de produtos limpo, chave id_produto.
#
# POR QUE materialized view com leitura batch (spark.read.table):
#   A bronze e SOBRESCRITA a cada execucao da ingestao. Uma streaming table exige uma fonte
#   append-only e quebraria (ou exigiria full refresh manual) toda vez que a bronze fosse
#   reescrita. A materialized view recalcula o resultado inteiro a partir da bronze atual,
#   que e exatamente a semantica que queremos.
#
# POR QUE deduplicar com row_number em vez de dropDuplicates:
#   dropDuplicates escolhe uma linha arbitraria. Com row_number sobre uma janela ordenada
#   o resultado e deterministico: duas execucoes sobre a mesma bronze dao o mesmo produto.
#   Hoje a bronze nao tem duplicatas, mas ela e reescrita por outro processo -- a dedup e a
#   garantia de que a chave da silver continua unica mesmo se isso mudar.
#
# POR QUE DECIMAL(10,2) em preco_atual:
#   double acumula erro de ponto flutuante. Dinheiro em double faz a soma da receita divergir
#   de centavos, e e a receita que o negocio confere. DECIMAL(10,2) e exato.
#
# POR QUE os fails sao expect_all_or_fail:
#   id_produto e a chave -- sem ela nao ha como ligar venda a produto. preco_atual <= 0 nao e
#   "dado sujo", e produto impossivel: faria a faixa_preco e o preco_suspeito da concorrencia
#   mentirem. Nenhum dos dois pode existir, entao o pipeline deve parar, nao avisar.

from pyspark import pipelines as dp
from pyspark.sql import Window
from pyspark.sql import functions as F


@dp.materialized_view(
    name="silver.produtos",
    comment="Produtos deduplicados por id_produto, com preco em DECIMAL(10,2) e faixa de preco.",
)
@dp.expect_all_or_fail(
    {
        "id_produto_preenchido": "id_produto IS NOT NULL AND trim(id_produto) <> ''",
        "preco_atual_positivo": "preco_atual > 0",
    }
)
def silver_produtos():
    bronze = spark.read.table("bronze.produtos")

    # Ordenacao da janela: o produto mais recente vence; id_produto desempata para
    # tornar a escolha deterministica quando duas linhas tem a mesma data_criacao.
    janela = Window.partitionBy("id_produto").orderBy(
        F.col("data_criacao").desc_nulls_last(), F.col("nome_produto").asc_nulls_last()
    )

    return (
        bronze.withColumn("_ordem", F.row_number().over(janela))
        .filter(F.col("_ordem") == 1)
        .drop("_ordem")
        .select(
            F.col("id_produto"),
            # trim defensivo: hoje a bronze vem limpa, mas nome com espaco sobrando
            # quebraria qualquer join ou agrupamento por nome la na gold.
            F.trim(F.col("nome_produto")).alias("nome_produto"),
            F.col("categoria"),
            F.col("marca"),
            F.col("preco_atual").cast("decimal(10,2)").alias("preco_atual"),
            # Faixas na ordem do enunciado: > 1000 PREMIUM, > 500 MEDIO, resto BASICO.
            # A ordem dos when importa -- o primeiro que casar vence.
            F.when(F.col("preco_atual") > 1000, F.lit("PREMIUM"))
            .when(F.col("preco_atual") > 500, F.lit("MEDIO"))
            .otherwise(F.lit("BASICO"))
            .alias("faixa_preco"),
            F.col("data_criacao"),
        )
    )
