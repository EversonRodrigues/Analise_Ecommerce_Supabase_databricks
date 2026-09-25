-- gold.vendas_produtos -- desempenho por produto, para a Diretoria Comercial.
--
-- POR QUE o LEFT JOIN parte de silver.vendas e nao de silver.produtos:
--   O grao pedido e "produto VENDIDO". Partindo das vendas, as 20 vendas de produto fora do
--   catalogo continuam na tabela (dinheiro que entrou e receita) e os 30 produtos cadastrados que
--   nunca venderam ficam de fora. Se partisse de silver.produtos seria o contrario: os nao
--   cadastrados sumiriam e a receita nao fecharia com a da silver.
--
-- POR QUE produto sem cadastro ganha rotulo em vez de NULL:
--   nome_produto, categoria, marca e faixa_preco sao colunas de filtro do dashboard. NULL num
--   filtro some da lista e o usuario nunca ve esses 20 produtos -- justamente os que precisam de
--   atencao do time de cadastro. Com rotulo explicito eles viram uma fatia visivel (R$ 4.240,01).
--
-- POR QUE o comentario de nome_produto manda contar por id_produto:
--   55 nomes de produto se repetem em 137 ids diferentes. "Edredom Casal" sozinho tem 7 ids.
--   Agrupar por nome soma produtos distintos e infla o resultado sem dar erro nenhum -- e o tipo
--   de engano que o Genie cometeria calado.
--
-- POR QUE ROW_NUMBER fica no SELECT externo:
--   Os dois rankings dependem da receita ja agregada por produto, entao a agregacao vai numa CTE
--   e as janelas rodam sobre o resultado dela.

CREATE OR REFRESH MATERIALIZED VIEW gold.vendas_produtos (
  id_produto STRING COMMENT
    'Identificador unico do produto. Uma linha por produto -- esta e a chave correta para contar produtos.',
  nome_produto STRING COMMENT
    'Nome do produto. ATENCAO: o nome NAO e unico -- 55 nomes se repetem em 137 produtos diferentes (o nome "Edredom Casal" pertence a 7 produtos distintos). Para contar ou agrupar produtos use id_produto, nunca nome_produto. Vale "Produto nao cadastrado" quando o id_produto vendido nao existe no catalogo.',
  categoria STRING COMMENT
    'Categoria do produto, ex.: Moda, Audio, Casa. Vale "Nao cadastrado" quando o produto nao existe no catalogo.',
  marca STRING COMMENT
    'Marca do produto. Vale "Nao cadastrado" quando o produto nao existe no catalogo.',
  faixa_preco STRING COMMENT
    'Faixa de preco do produto no catalogo: PREMIUM (preco acima de R$ 1.000), MEDIO (acima de R$ 500) ou BASICO. Vale "Nao cadastrado" quando o produto nao existe no catalogo.',
  produto_cadastrado BOOLEAN COMMENT
    'Indica se o id_produto existe no catalogo (silver.produtos). false significa venda de produto fora do catalogo: a receita e real e esta contabilizada, o que falta e o cadastro. Sao 20 produtos nessa situacao.',
  total_vendas BIGINT COMMENT
    'Quantidade de vendas (pedidos) que incluiram este produto. Somavel entre linhas.',
  itens_vendidos BIGINT COMMENT
    'Soma das quantidades deste produto vendidas. E maior que total_vendas porque uma venda pode levar varias unidades. Somavel entre linhas.',
  receita DECIMAL(10,2) COMMENT
    'Receita gerada por este produto, em reais (R$). Calculo: soma de quantidade x preco_unitario das vendas do produto. Somavel entre linhas: a soma de toda a tabela fecha com a receita total da empresa no periodo.',
  ticket_medio DECIMAL(10,2) COMMENT
    'Valor medio de UMA venda deste produto, em reais (R$). Calculo: ROUND(AVG(receita_da_venda), 2), ou seja receita / total_vendas. NAO e o preco unitario do produto.',
  ranking_receita INT COMMENT
    'Posicao do produto por receita entre TODOS os produtos, do maior para o menor. 1 e o produto que mais faturou. Para "os 10 produtos que mais venderam" use ranking_receita <= 10.',
  ranking_na_categoria INT COMMENT
    'Posicao do produto por receita DENTRO da sua categoria. 1 e o produto que mais faturou na categoria. Para "o campeao de cada categoria" use ranking_na_categoria = 1.'
)
COMMENT
  'Desempenho de vendas por produto, para a Diretoria Comercial. Use esta tabela para responder quais produtos mais vendem, quanto cada um faturou, como se comparam dentro da categoria e quais nao estao cadastrados. Uma linha por produto vendido. ATENCAO: so aparecem produtos COM pelo menos uma venda -- os 30 produtos cadastrados que nunca venderam NAO estao aqui, entao esta tabela nao responde "quais produtos nao venderam" (essa pergunta precisa de silver.produtos). Inclui os 20 produtos vendidos que nao existem no catalogo, marcados com produto_cadastrado = false. Valores monetarios em reais (R$). Periodo coberto: 13/12/2025 a 11/01/2026. A receita desta tabela fecha exatamente com a de silver.vendas.'
AS
WITH agregado AS (
  SELECT
    v.id_produto,
    COALESCE(pr.nome_produto, 'Produto não cadastrado') AS nome_produto,
    COALESCE(pr.categoria, 'Não cadastrado') AS categoria,
    COALESCE(pr.marca, 'Não cadastrado') AS marca,
    COALESCE(pr.faixa_preco, 'Não cadastrado') AS faixa_preco,
    -- produto_cadastrado ja vem resolvido de silver.vendas e e constante dentro do id_produto;
    -- o MAX e so para satisfazer a agregacao.
    MAX(v.produto_cadastrado) AS produto_cadastrado,
    COUNT(*) AS total_vendas,
    SUM(v.quantidade) AS itens_vendidos,
    CAST(SUM(v.receita) AS DECIMAL(10,2)) AS receita,
    CAST(ROUND(AVG(v.receita), 2) AS DECIMAL(10,2)) AS ticket_medio
  FROM silver.vendas v
  LEFT JOIN silver.produtos pr
    ON pr.id_produto = v.id_produto
  GROUP BY
    v.id_produto,
    COALESCE(pr.nome_produto, 'Produto não cadastrado'),
    COALESCE(pr.categoria, 'Não cadastrado'),
    COALESCE(pr.marca, 'Não cadastrado'),
    COALESCE(pr.faixa_preco, 'Não cadastrado')
)
SELECT
  id_produto,
  nome_produto,
  categoria,
  marca,
  faixa_preco,
  produto_cadastrado,
  total_vendas,
  itens_vendidos,
  receita,
  ticket_medio,
  -- ROW_NUMBER devolve BIGINT; o CAST e o que faz casar com o INT declarado la em cima.
  CAST(ROW_NUMBER() OVER (ORDER BY receita DESC) AS INT) AS ranking_receita,
  CAST(ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY receita DESC) AS INT) AS ranking_na_categoria
FROM agregado
