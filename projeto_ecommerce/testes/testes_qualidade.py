# Databricks notebook source
# MAGIC %md
# MAGIC # Testes de qualidade da camada silver
# MAGIC
# MAGIC Roda depois do pipeline, dentro do Job "Pipeline E-commerce".
# MAGIC
# MAGIC **Por que testes separados se ja existem expectations?**
# MAGIC As expectations medem cada tabela isoladamente, durante a escrita. Estes testes olham o
# MAGIC resultado **ja publicado** e cruzam tabelas -- e a checagem que um consumidor da silver
# MAGIC faria. Se uma expectation for removida por engano, o teste ainda pega.
# MAGIC
# MAGIC **Por que contar linhas com problema em vez de comparar totais?**
# MAGIC Total esperado muda toda vez que a bronze muda. "Zero linhas com problema" continua
# MAGIC valendo independente do volume.
# MAGIC
# MAGIC **Por que mostrar a tabela ANTES de falhar?**
# MAGIC Se o AssertionError subisse no primeiro teste vermelho, quem abre o run veria um unico
# MAGIC erro e nao saberia o que mais quebrou. Rodamos todos, mostramos o quadro completo e so
# MAGIC entao falhamos.

# COMMAND ----------

dbutils.widgets.text("catalogo", "projetoecomerce", "Catalogo")
catalogo = dbutils.widgets.get("catalogo")

spark.sql(f"USE CATALOG {catalogo}")
print(f"Catalogo em uso: {catalogo}")

# COMMAND ----------

# Cada teste e uma consulta que devolve duas colunas:
#   problemas -> quantidade de linhas com problema (0 = passou)
#   detalhe   -> texto curto com o contexto do numero, para aparecer no relatorio
TESTES = [
    (
        "chave_unica_silver_produtos",
        """
        SELECT count(*) AS problemas,
               concat(count(*), ' id_produto repetido(s)') AS detalhe
        FROM (SELECT id_produto FROM silver.produtos GROUP BY id_produto HAVING count(*) > 1)
        """,
    ),
    (
        "chave_unica_silver_clientes",
        """
        SELECT count(*) AS problemas,
               concat(count(*), ' id_cliente repetido(s)') AS detalhe
        FROM (SELECT id_cliente FROM silver.clientes GROUP BY id_cliente HAVING count(*) > 1)
        """,
    ),
    (
        "chave_unica_silver_preco_competidores",
        """
        SELECT count(*) AS problemas,
               concat(count(*), ' par(es) id_produto+nome_concorrente repetido(s)') AS detalhe
        FROM (
            SELECT id_produto, nome_concorrente
            FROM silver.preco_competidores
            GROUP BY id_produto, nome_concorrente
            HAVING count(*) > 1
        )
        """,
    ),
    (
        "chave_unica_silver_vendas",
        """
        SELECT count(*) AS problemas,
               concat(count(*), ' id_venda repetido(s)') AS detalhe
        FROM (SELECT id_venda FROM silver.vendas GROUP BY id_venda HAVING count(*) > 1)
        """,
    ),
    (
        "receita_igual_quantidade_vezes_preco",
        """
        SELECT count(*) AS problemas,
               concat(count(*), ' venda(s) com receita divergente') AS detalhe
        FROM silver.vendas
        WHERE receita <> cast(quantidade * preco_unitario AS DECIMAL(10,2))
        """,
    ),
    (
        "vendas_sem_produto_cadastrado_abaixo_de_1_pct",
        """
        -- O problema aqui nao e a existencia de venda orfa (sabemos que existem e nao as
        -- descartamos), e sim o percentual passar de 1%. A consulta devolve 1 quando estoura.
        SELECT CASE WHEN pct >= 1.0 THEN 1 ELSE 0 END AS problemas,
               concat(sem_cadastro, ' de ', total, ' vendas (', round(pct, 3), '%)') AS detalhe
        FROM (
            SELECT count_if(NOT produto_cadastrado) AS sem_cadastro,
                   count(*) AS total,
                   100.0 * count_if(NOT produto_cadastrado) / count(*) AS pct
            FROM silver.vendas
        )
        """,
    ),
]

# COMMAND ----------

resultados = []
for nome, sql in TESTES:
    try:
        linha = spark.sql(sql).collect()[0]
        problemas = int(linha["problemas"])
        detalhe = linha["detalhe"]
        erro = None
    except Exception as exc:  # consulta que nem roda tambem e falha de qualidade
        problemas, detalhe, erro = -1, f"ERRO AO EXECUTAR: {exc}", exc
    resultados.append(
        {
            "teste": nome,
            "problemas": problemas,
            "detalhe": detalhe,
            "passou": erro is None and problemas == 0,
        }
    )

display(spark.createDataFrame(resultados))

# COMMAND ----------

falhas = [r for r in resultados if not r["passou"]]

if falhas:
    linhas = "\n".join(f"  - {r['teste']}: {r['detalhe']}" for r in falhas)
    raise AssertionError(
        f"{len(falhas)} de {len(resultados)} testes de qualidade falharam:\n{linhas}"
    )

print(f"OK: {len(resultados)} testes de qualidade passaram.")
