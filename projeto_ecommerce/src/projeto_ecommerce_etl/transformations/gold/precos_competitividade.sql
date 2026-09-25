-- gold.precos_competitividade -- nosso preco contra a concorrencia, para a Diretoria de Pricing.
--
-- POR QUE o produto com preco suspeito CONTINUA em todas as contas:
--   Uma cotacao abaixo de 60% do nosso preco quase sempre e erro de coleta, mas promocao relampago
--   existe. Tirar essas cotacoes da media esconderia justamente a concorrencia real e agressiva --
--   que e a informacao mais valiosa desta tabela. Entao a linha entra nas contas normalmente e a
--   coluna possui_preco_suspeito ALERTA que aquele preco precisa ser confirmado antes de reagir.
--   O alerta e sobre a confianca no dado, nao sobre a validade do numero.
--
-- POR QUE o JOIN com os concorrentes e INNER e o de vendas e LEFT:
--   O grao pedido e "produto que TEM preco de concorrente" -- sem cotacao nao ha comparacao a
--   fazer, entao INNER. Ja produto sem venda importa: se estamos mais caros que todos e o produto
--   nao vende, a hipotese do preco ser a causa fica em cima da mesa. Por isso LEFT JOIN com
--   vendas e COALESCE para 0 (30 produtos estao nessa situacao).
--
-- POR QUE total_concorrentes e coluna e nao detalhe:
--   106 produtos tem 4 cotacoes, 88 tem 3, 19 tem 2 e 2 tem apenas 1. "Mais caro que todos" com um
--   unico concorrente nao tem o mesmo peso que com quatro. Sem esta coluna o diretor tomaria as
--   duas situacoes como iguais.
--
-- POR QUE a ordem dos WHEN da classificacao importa:
--   MAIS_CARO_QUE_TODOS e MAIS_BARATO_QUE_TODOS sao casos extremos e vem primeiro. Quem esta acima
--   do maximo tambem esta acima da media, e o rotulo mais informativo tem de vencer.
--
-- POR QUE NA_MEDIA nao tem banda de tolerancia:
--   Decidido com a area: NA_MEDIA so quando nosso preco e exatamente igual a media. A base tem 6
--   produtos nessa situacao, dois deles com todos os concorrentes cobrando exatamente o mesmo que
--   nos. Uma banda de tolerancia (+/- 1 ou 2 pontos) jogaria de 56 a 122 produtos em NA_MEDIA e
--   esvaziaria ACIMA/ABAIXO_DA_MEDIA, que sao as classes de acao.

CREATE OR REFRESH MATERIALIZED VIEW gold.precos_competitividade (
  id_produto STRING COMMENT
    'Identificador unico do produto. Uma linha por produto -- esta e a chave desta tabela.',
  nome_produto STRING COMMENT
    'Nome do produto. ATENCAO: o nome NAO e unico -- produtos diferentes compartilham o mesmo nome. Para contar ou agrupar produtos use id_produto.',
  categoria STRING COMMENT
    'Categoria do produto, ex.: Moda, Audio, Casa.',
  marca STRING COMMENT
    'Marca do produto.',
  nosso_preco DECIMAL(10,2) COMMENT
    'Nosso preco de tabela atual do produto, em reais (R$). Vem de silver.produtos.preco_atual. Nao e o preco praticado em cada venda: para isso use preco_unitario em gold.vendas_detalhadas.',
  preco_medio_concorrentes DECIMAL(10,2) COMMENT
    'Media dos precos cotados nos concorrentes (Mercado Livre, Amazon, Magalu e Shopee), em reais (R$). Calculo: ROUND(AVG(preco_concorrente), 2). Inclui cotacoes marcadas como suspeitas -- veja possui_preco_suspeito.',
  preco_minimo_concorrentes DECIMAL(10,2) COMMENT
    'Menor preco cotado entre os concorrentes, em reais (R$). E o preco que temos de bater para ser o mais barato do mercado.',
  preco_maximo_concorrentes DECIMAL(10,2) COMMENT
    'Maior preco cotado entre os concorrentes, em reais (R$). Estar acima dele e o pior cenario e gera a classificacao MAIS_CARO_QUE_TODOS.',
  total_concorrentes BIGINT COMMENT
    'Quantidade de concorrentes com preco cotado para este produto, de 1 a 4. IMPORTANTE para interpretar a comparacao: 2 produtos tem apenas 1 cotacao e 19 tem 2, entao nesses casos a media e o maximo sao pouco representativos. 106 produtos tem as 4 cotacoes.',
  diferenca_pct_vs_media DECIMAL(10,2) COMMENT
    'Quanto nosso preco esta acima (positivo) ou abaixo (negativo) da media dos concorrentes, em PONTOS PERCENTUAIS. O valor 10 significa "10% mais caro que a media"; -5 significa "5% mais barato". NAO e fracao (nao e 0,10). Calculo: ROUND(100 * (nosso_preco - preco_medio_concorrentes) / preco_medio_concorrentes, 2).',
  diferenca_pct_vs_minimo DECIMAL(10,2) COMMENT
    'Quanto nosso preco esta acima (positivo) ou abaixo (negativo) do MENOR preco dos concorrentes, em PONTOS PERCENTUAIS. O valor 10 significa "10% mais caro que o concorrente mais barato". NAO e fracao. Calculo: ROUND(100 * (nosso_preco - preco_minimo_concorrentes) / preco_minimo_concorrentes, 2).',
  classificacao_preco STRING COMMENT
    'Posicao do nosso preco frente aos concorrentes. Assume exatamente um de: MAIS_CARO_QUE_TODOS (nosso preco acima do maior preco dos concorrentes), MAIS_BARATO_QUE_TODOS (abaixo do menor), NA_MEDIA (exatamente igual a media, sem banda de tolerancia), ACIMA_DA_MEDIA e ABAIXO_DA_MEDIA. As regras sao avaliadas nessa ordem, entao um produto acima do maximo recebe MAIS_CARO_QUE_TODOS e nao ACIMA_DA_MEDIA. Para "onde agir no preco" comece por MAIS_CARO_QUE_TODOS.',
  possui_preco_suspeito BOOLEAN COMMENT
    'true quando pelo menos um concorrente cotou abaixo de 60% do nosso preco. ATENCAO: isso NAO invalida as demais colunas -- a cotacao suspeita ENTRA na media, no minimo e no maximo, porque promocao relampago e concorrencia agressiva de verdade existem. A coluna serve para confirmar o preco na fonte antes de reagir a ele. Sao 15 produtos nessa situacao, cobrindo 55 cotacoes.',
  receita DECIMAL(10,2) COMMENT
    'Receita gerada por este produto no periodo, em reais (R$). Vale 0 quando o produto nunca vendeu (30 produtos). Use junto com classificacao_preco para priorizar: produto caro que fatura muito e risco alto; produto caro que nao vende pode ter o preco como causa.',
  itens_vendidos BIGINT COMMENT
    'Unidades vendidas deste produto no periodo. Vale 0 quando o produto nunca vendeu.'
)
COMMENT
  'Competitividade de preco por produto, para a Diretoria de Pricing. Use esta tabela para responder se estamos mais caros que a concorrencia (Mercado Livre, Amazon, Magalu e Shopee) e em quais produtos agir. Uma linha por produto do catalogo que tem ao menos uma cotacao de concorrente -- sao os 215 produtos do catalogo. ATENCAO: a soma da coluna receita da R$ 969.837,27, e NAO a receita total da empresa (R$ 974.077,28). Faltam os R$ 4.240,01 das vendas de 20 produtos que nao existem no catalogo: sem cadastro eles nao tem preco de concorrente e nao cabem nesta tabela. Para receita total use gold.vendas_detalhadas ou gold.vendas_produtos. Valores monetarios em reais (R$) e diferencas em pontos percentuais. Periodo dos dados: 13/12/2025 a 11/01/2026.'
AS
WITH concorrentes AS (
  SELECT
    id_produto,
    CAST(ROUND(AVG(preco_concorrente), 2) AS DECIMAL(10,2)) AS preco_medio_concorrentes,
    CAST(MIN(preco_concorrente) AS DECIMAL(10,2)) AS preco_minimo_concorrentes,
    CAST(MAX(preco_concorrente) AS DECIMAL(10,2)) AS preco_maximo_concorrentes,
    COUNT(*) AS total_concorrentes,
    -- MAX sobre boolean = "existe algum true", que e exatamente "possui preco suspeito".
    MAX(preco_suspeito) AS possui_preco_suspeito
  FROM silver.preco_competidores
  GROUP BY id_produto
),
vendas_por_produto AS (
  SELECT
    id_produto,
    CAST(SUM(receita) AS DECIMAL(10,2)) AS receita,
    SUM(quantidade) AS itens_vendidos
  FROM silver.vendas
  GROUP BY id_produto
)
SELECT
  p.id_produto,
  p.nome_produto,
  p.categoria,
  p.marca,
  p.preco_atual AS nosso_preco,
  c.preco_medio_concorrentes,
  c.preco_minimo_concorrentes,
  c.preco_maximo_concorrentes,
  c.total_concorrentes,
  CAST(
    ROUND(100.0 * (p.preco_atual - c.preco_medio_concorrentes) / c.preco_medio_concorrentes, 2)
    AS DECIMAL(10,2)
  ) AS diferenca_pct_vs_media,
  CAST(
    ROUND(100.0 * (p.preco_atual - c.preco_minimo_concorrentes) / c.preco_minimo_concorrentes, 2)
    AS DECIMAL(10,2)
  ) AS diferenca_pct_vs_minimo,
  CASE
    WHEN p.preco_atual > c.preco_maximo_concorrentes THEN 'MAIS_CARO_QUE_TODOS'
    WHEN p.preco_atual < c.preco_minimo_concorrentes THEN 'MAIS_BARATO_QUE_TODOS'
    WHEN p.preco_atual = c.preco_medio_concorrentes THEN 'NA_MEDIA'
    WHEN p.preco_atual > c.preco_medio_concorrentes THEN 'ACIMA_DA_MEDIA'
    ELSE 'ABAIXO_DA_MEDIA'
  END AS classificacao_preco,
  c.possui_preco_suspeito,
  -- COALESCE porque o LEFT JOIN deixa NULL em produto que nunca vendeu, e o negocio le isso
  -- como "faturou zero", nao como "nao sabemos".
  COALESCE(v.receita, CAST(0 AS DECIMAL(10,2))) AS receita,
  COALESCE(v.itens_vendidos, 0) AS itens_vendidos
FROM silver.produtos p
JOIN concorrentes c
  ON c.id_produto = p.id_produto
LEFT JOIN vendas_por_produto v
  ON v.id_produto = p.id_produto
