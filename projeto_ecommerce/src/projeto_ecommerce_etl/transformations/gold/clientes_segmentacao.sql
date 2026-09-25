-- gold.clientes_segmentacao -- carteira de clientes da Diretoria de Customer Success.
--
-- POR QUE cada coluna e declarada com TIPO e COMMENT:
--   Esta tabela e consumida por dashboard e pelo Genie, que escreve SQL a partir de perguntas em
--   portugues. O Genie le os comentarios do catalogo: coluna sem comentario e coluna que ele vai
--   interpretar por adivinhacao. E no Databricks o COMMENT so e gravado quando o TIPO tambem esta
--   declarado -- sem o tipo, o comentario e silenciosamente ignorado. Por isso a lista entre
--   parenteses, e nao um SELECT com apelidos.
--
-- POR QUE LEFT JOIN a partir de silver.clientes:
--   O cliente que NUNCA comprou tem de aparecer, com receita zero. E justamente ele que o time de
--   CS precisa ativar -- some da tabela e some da estrategia. Um INNER JOIN entregaria so quem ja
--   compra, que e o oposto do pedido.
--
-- POR QUE todas as vendas entram, inclusive de produto nao cadastrado:
--   Dinheiro que entrou e receita. silver.vendas marca essas 20 vendas em produto_cadastrado = false
--   mas nao as descarta; filtrar aqui faria a receita da gold nao fechar com a da silver, e o teste
--   de qualidade pegaria isso na hora.
--
-- POR QUE os limites de segmentacao sao 22.000 e 17.000:
--   Os limites antigos (R$ 10.000 para VIP e R$ 5.000 para TOP_TIER) foram descartados porque nao
--   segmentavam nada: aplicados a distribuicao real, 49 dos 50 clientes caiam em VIP e 1 em
--   TOP_TIER. Um segmento que contem quase todo mundo nao informa decisao nenhuma. Os limites
--   atuais saem da distribuicao real, acordados com a diretora, e dividem a carteira em
--   10 VIP / 25 TOP_TIER / 15 REGULAR.
--
-- POR QUE ROW_NUMBER fica no SELECT externo:
--   O ranking depende da receita ja agregada. Numa unica passada a janela nao ve o SUM, entao a
--   agregacao vai numa CTE e o ranking e calculado sobre o resultado dela.

CREATE OR REFRESH MATERIALIZED VIEW gold.clientes_segmentacao (
  id_cliente STRING COMMENT
    'Identificador unico do cliente. Uma linha por cliente -- pode ser usado como chave.',
  nome_cliente STRING COMMENT
    'Nome do cliente ja limpo: sem pronome de tratamento (Sr., Sra., Srta., Dr., Dra.) e em formato titulo. O nome como veio da origem esta em silver.clientes.nome_original.',
  estado STRING COMMENT
    'Sigla da unidade federativa (UF) com 2 letras maiusculas, ex.: SP, MG, AC. Para perguntas por nome do estado use nome_estado.',
  nome_estado STRING COMMENT
    'Nome completo do estado conforme o IBGE, ex.: Sao Paulo, Minas Gerais.',
  regiao STRING COMMENT
    'Regiao do IBGE. Assume exatamente um de: Norte, Nordeste, Centro-Oeste, Sudeste, Sul.',
  total_compras BIGINT COMMENT
    'Quantidade de vendas do cliente no periodo. Zero significa cliente que nunca comprou. Use total_compras > 0 para filtrar clientes ativos.',
  receita DECIMAL(10,2) COMMENT
    'Receita total do cliente no periodo, em reais (R$). Calculo: soma de quantidade x preco_unitario de todas as vendas do cliente, incluindo vendas de produto nao cadastrado. Zero significa cliente que nunca comprou, nao dado faltante.',
  ticket_medio DECIMAL(10,2) COMMENT
    'Valor medio de UMA venda do cliente, em reais (R$). Calculo: ROUND(AVG(receita_da_venda), 2), ou seja receita / total_compras. NAO e gasto medio por mes nem por dia. Nulo para quem nunca comprou.',
  primeira_compra DATE COMMENT
    'Data da primeira venda do cliente. Nula para quem nunca comprou.',
  ultima_compra DATE COMMENT
    'Data da venda mais recente do cliente. Nula para quem nunca comprou. Serve para medir recencia: quanto mais antiga, maior o risco de churn.',
  segmento_cliente STRING COMMENT
    'Segmento de valor do cliente. Assume exatamente um de: VIP (receita a partir de R$ 22.000), TOP_TIER (receita de R$ 17.000 a R$ 21.999,99) e REGULAR (receita abaixo de R$ 17.000). Os limites foram definidos com a Diretoria de Customer Success a partir da distribuicao real de receita.',
  ranking_receita INT COMMENT
    'Posicao do cliente por receita, do maior para o menor. 1 e o cliente de maior receita. Para "os 10 melhores clientes" use ranking_receita <= 10.'
)
COMMENT
  'Carteira de clientes da Diretoria de Customer Success: uma linha por cliente, com receita, segmento de valor, localizacao (estado e regiao) e ranking. Use esta tabela para responder quem sao os melhores clientes, onde eles estao e como a carteira se divide em segmentos. INCLUI clientes que nunca compraram (receita 0, total_compras 0, datas nulas) -- sao o publico de ativacao do CS. Valores monetarios em reais (R$). Periodo coberto pelos dados: 13/12/2025 a 11/01/2026; nao ha dados fora desse intervalo, entao perguntas sobre outros meses nao tem resposta aqui. A receita desta tabela fecha exatamente com a de silver.vendas.'
AS
WITH agregado AS (
  SELECT
    cl.id_cliente,
    cl.nome_cliente,
    cl.estado,
    cl.nome_estado,
    cl.regiao,
    COUNT(v.id_venda) AS total_compras,
    -- COALESCE antes do CAST: sem vendas, SUM devolve NULL e o cliente ficaria sem receita
    -- em vez de com receita zero -- o que quebraria o ranking e a segmentacao.
    CAST(COALESCE(SUM(v.receita), 0) AS DECIMAL(10,2)) AS receita,
    CAST(ROUND(AVG(v.receita), 2) AS DECIMAL(10,2)) AS ticket_medio,
    MIN(v.data) AS primeira_compra,
    MAX(v.data) AS ultima_compra
  FROM silver.clientes cl
  LEFT JOIN silver.vendas v
    ON v.id_cliente = cl.id_cliente
  GROUP BY
    cl.id_cliente,
    cl.nome_cliente,
    cl.estado,
    cl.nome_estado,
    cl.regiao
)
SELECT
  id_cliente,
  nome_cliente,
  estado,
  nome_estado,
  regiao,
  total_compras,
  receita,
  ticket_medio,
  primeira_compra,
  ultima_compra,
  -- A ordem dos WHEN importa: o primeiro que casar vence, entao o corte mais alto vem primeiro.
  CASE
    WHEN receita >= 22000 THEN 'VIP'
    WHEN receita >= 17000 THEN 'TOP_TIER'
    ELSE 'REGULAR'
  END AS segmento_cliente,
  CAST(ROW_NUMBER() OVER (ORDER BY receita DESC) AS INT) AS ranking_receita
FROM agregado
