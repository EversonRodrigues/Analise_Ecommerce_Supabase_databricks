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
    # ---------------- gold.clientes_segmentacao (Customer Success) ----------------
    (
        "gold_clientes_receita_fecha_com_silver",
        """
        -- A prova de que o LEFT JOIN da gold nao perdeu dinheiro. Se uma venda tiver
        -- id_cliente que nao existe em silver.clientes, ela sai da gold e este teste acusa.
        SELECT CASE WHEN receita_gold = receita_silver THEN 0 ELSE 1 END AS problemas,
               concat('gold ', receita_gold, ' vs silver ', receita_silver,
                      ' (diferenca ', receita_gold - receita_silver, ')') AS detalhe
        FROM (
            SELECT (SELECT sum(receita) FROM gold.clientes_segmentacao) AS receita_gold,
                   (SELECT sum(receita) FROM silver.vendas) AS receita_silver
        )
        """,
    ),
    (
        "gold_clientes_id_unico",
        """
        SELECT count(*) AS problemas,
               concat(count(*), ' id_cliente repetido(s)') AS detalhe
        FROM (
            SELECT id_cliente FROM gold.clientes_segmentacao
            GROUP BY id_cliente HAVING count(*) > 1
        )
        """,
    ),
    (
        "gold_clientes_segmento_valido",
        """
        SELECT count(*) AS problemas,
               concat(count(*), ' linha(s) com segmento fora de VIP/TOP_TIER/REGULAR') AS detalhe
        FROM gold.clientes_segmentacao
        WHERE segmento_cliente NOT IN ('VIP', 'TOP_TIER', 'REGULAR')
           OR segmento_cliente IS NULL
        """,
    ),
    (
        "gold_clientes_vip_acima_de_22000",
        """
        SELECT count(*) AS problemas,
               concat(count(*), ' VIP com receita abaixo de R$ 22.000') AS detalhe
        FROM gold.clientes_segmentacao
        WHERE segmento_cliente = 'VIP' AND receita < 22000
        """,
    ),
    # ---------------- golds da Diretoria Comercial ----------------
    # As tres primeiras provam que nenhuma agregacao perdeu ou inventou dinheiro. Sao a rede que
    # pega um INNER JOIN colocado por engano no lugar de um LEFT JOIN: bastaria isso para as 20
    # vendas de produto nao cadastrado sumirem e a receita cair R$ 4.240,01 sem erro nenhum.
    (
        "gold_temporais_receita_fecha_com_silver",
        """
        SELECT CASE WHEN a = b THEN 0 ELSE 1 END AS problemas,
               concat('vendas_temporais ', a, ' vs silver ', b, ' (diferenca ', a - b, ')') AS detalhe
        FROM (
            SELECT (SELECT sum(receita) FROM gold.vendas_temporais) AS a,
                   (SELECT sum(receita) FROM silver.vendas) AS b
        )
        """,
    ),
    (
        "gold_produtos_receita_fecha_com_silver",
        """
        SELECT CASE WHEN a = b THEN 0 ELSE 1 END AS problemas,
               concat('vendas_produtos ', a, ' vs silver ', b, ' (diferenca ', a - b, ')') AS detalhe
        FROM (
            SELECT (SELECT sum(receita) FROM gold.vendas_produtos) AS a,
                   (SELECT sum(receita) FROM silver.vendas) AS b
        )
        """,
    ),
    (
        "gold_detalhadas_receita_fecha_com_silver",
        """
        SELECT CASE WHEN a = b THEN 0 ELSE 1 END AS problemas,
               concat('vendas_detalhadas ', a, ' vs silver ', b, ' (diferenca ', a - b, ')') AS detalhe
        FROM (
            SELECT (SELECT sum(receita) FROM gold.vendas_detalhadas) AS a,
                   (SELECT sum(receita) FROM silver.vendas) AS b
        )
        """,
    ),
    (
        "gold_detalhadas_mesmo_numero_de_linhas_da_silver",
        """
        SELECT CASE WHEN a = b THEN 0 ELSE 1 END AS problemas,
               concat('vendas_detalhadas ', a, ' linhas vs silver ', b) AS detalhe
        FROM (
            SELECT (SELECT count(*) FROM gold.vendas_detalhadas) AS a,
                   (SELECT count(*) FROM silver.vendas) AS b
        )
        """,
    ),
    (
        "gold_detalhadas_id_venda_unico",
        """
        SELECT count(*) AS problemas,
               concat(count(*), ' id_venda repetido(s)') AS detalhe
        FROM (
            SELECT id_venda FROM gold.vendas_detalhadas
            GROUP BY id_venda HAVING count(*) > 1
        )
        """,
    ),
    (
        "gold_detalhadas_toda_venda_com_segmento_e_regiao",
        """
        -- Se o join com gold.clientes_segmentacao falhar para alguma venda, a linha fica na
        -- tabela (LEFT JOIN) mas sem segmento nem regiao -- e as perguntas cruzadas passariam a
        -- responder errado sem avisar.
        SELECT count(*) AS problemas,
               concat(count(*), ' venda(s) sem segmento ou sem regiao') AS detalhe
        FROM gold.vendas_detalhadas
        WHERE segmento_cliente IS NULL OR regiao IS NULL
        """,
    ),
    # ---------------- gold da Diretoria de Pricing ----------------
    (
        "gold_precos_id_produto_unico",
        """
        -- O grao e "um produto". Se a agregacao de silver.preco_competidores vazar mais de uma
        -- linha por id_produto, a media do concorrente aparece duplicada e o diretor ve o mesmo
        -- produto duas vezes na lista de acao.
        SELECT count(*) AS problemas,
               concat(count(*), ' id_produto repetido(s)') AS detalhe
        FROM (
            SELECT id_produto FROM gold.precos_competitividade
            GROUP BY id_produto HAVING count(*) > 1
        )
        """,
    ),
    (
        "gold_todas_as_colunas_comentadas",
        """
        -- O Genie le os comentarios do catalogo. Coluna sem comentario e coluna que a IA vai
        -- interpretar por adivinhacao, entao isso e falha de qualidade, nao detalhe cosmetico.
        --
        -- O filtro por table_type e de proposito: ao lado de cada materialized view o pipeline
        -- cria tabelas MANAGED internas (__materialization_mat_<pipeline_id>_<tabela>_N) e, no
        -- schema padrao, um event_log_<pipeline_id>. Nenhuma delas e tabela de consumo e nenhuma
        -- tem comentario. Filtrar por tipo em vez de por prefixo de nome mantem o teste valido
        -- se a Databricks mudar esses prefixos; o NOT LIKE fica como reforco.
        SELECT count(*) AS problemas,
               concat(count(*), ' coluna(s) sem comentario em ',
                      count(DISTINCT c.table_name), ' tabela(s)') AS detalhe
        FROM information_schema.columns c
        JOIN information_schema.tables t
          ON  t.table_catalog = c.table_catalog
          AND t.table_schema  = c.table_schema
          AND t.table_name    = c.table_name
        WHERE c.table_schema = 'gold'
          AND t.table_type IN ('MATERIALIZED_VIEW', 'STREAMING_TABLE', 'VIEW')
          AND c.table_name NOT LIKE '\\_\\_materialization%'
          AND c.table_name NOT LIKE 'event\\_log%'
          AND (c.comment IS NULL OR trim(c.comment) = '')
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
