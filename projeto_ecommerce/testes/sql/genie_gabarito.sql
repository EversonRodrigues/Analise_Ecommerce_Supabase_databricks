-- Gabarito do Genie space "Diretoria E-commerce".
--
-- POR QUE este arquivo existe:
--   O placar do space (testes/placar_genie.py) compara a resposta do Genie com o numero certo.
--   "Numero certo" nao pode ser um valor digitado a mao no script: tem de ser uma consulta na
--   gold, que continua valendo se a bronze mudar. Cada bloco abaixo e o gabarito de uma pergunta.
--
-- POR QUE em arquivo e nao dentro do .py:
--   O shell deste ambiente mangla acento e barra invertida em heredoc/echo. SQL sempre por
--   arquivo. Este arquivo e deliberadamente SEM ACENTO: o dado tem acento ('Tenis' vira 'Tênis'
--   no resultado), a consulta nao precisa.
--
-- FORMATO: cada bloco comeca com "-- @nome" e termina no proximo "-- @". O runner
--   (testes/placar_genie.py) parte o arquivo por esse marcador. Catalogo e schema vem da chamada
--   da API (projetoecomerce / gold), entao as consultas dizem so o nome da tabela.
--
-- Os blocos p01..p10 sao as 10 perguntas do teste; as duas de limite (lucro e "ontem") nao tem
-- gabarito em SQL de proposito: a resposta certa e o Genie recusar.
-- Os blocos ex_* sao os SQL de exemplo que vao para dentro do space.
-- Os blocos ini_* sao as 6 perguntas da tela inicial -- nenhuma pode voltar vazia.

-- @p01_receita_total
-- Esperado: R$ 974.077,28
SELECT SUM(receita) AS receita_total
FROM   vendas_detalhadas;

-- @p02_canal_que_vende_mais
-- Esperado: E-commerce, 2.155 vendas, R$ 705.486,21, ticket R$ 327,37
SELECT canal_venda,
       COUNT(*)                                  AS vendas,
       SUM(receita)                              AS receita,
       ROUND(SUM(receita) / COUNT(*), 2)         AS ticket_medio
FROM   vendas_detalhadas
GROUP  BY canal_venda
ORDER  BY receita DESC;

-- @p03_top5_produtos
-- Esperado: Fone de Ouvido Esportivo, Camisa Social, Necessaire, Persiana Vertical, Calca Jeans Skinny
SELECT nome_produto, receita, total_vendas
FROM   vendas_produtos
ORDER  BY receita DESC
LIMIT  5;

-- @p04_categoria_maior_receita
-- Esperado: Moda, R$ 248.124,15
SELECT categoria, SUM(receita) AS receita
FROM   vendas_detalhadas
GROUP  BY categoria
ORDER  BY receita DESC
LIMIT  5;

-- @p05_top5_clientes
-- Esperado: Ana Sophia Pereira (MG, R$ 30.716,63) em primeiro
SELECT nome_cliente, estado, receita, total_compras
FROM   clientes_segmentacao
ORDER  BY receita DESC
LIMIT  5;

-- @p06_vip_participacao
-- Esperado: 10 clientes VIP, R$ 262.806,22, 27,0% da receita
SELECT COUNT(*)                                                         AS clientes_vip,
       SUM(receita)                                                     AS receita_vip,
       ROUND(100 * SUM(receita) / (SELECT SUM(receita) FROM clientes_segmentacao), 1) AS pct_da_receita
FROM   clientes_segmentacao
WHERE  segmento_cliente = 'VIP';

-- @p07_regiao_maior_receita
-- Esperado: Norte, R$ 333.078,69, 17 clientes
SELECT regiao,
       SUM(receita)                  AS receita,
       COUNT(DISTINCT id_cliente)    AS clientes
FROM   vendas_detalhadas
GROUP  BY regiao
ORDER  BY receita DESC;

-- @p08_dia_semana
-- Esperado: quarta-feira pela media por dia (R$ 34.753,61); sabado lidera so no total, porque o
-- periodo tem 5 sabados e so 4 quartas.
SELECT dia_semana_num,
       dia_semana,
       COUNT(DISTINCT data)                                  AS dias_no_periodo,
       SUM(receita)                                          AS receita_total,
       ROUND(SUM(receita) / COUNT(DISTINCT data), 2)          AS receita_media_por_dia
FROM   vendas_detalhadas
GROUP  BY dia_semana_num, dia_semana
ORDER  BY receita_media_por_dia DESC;

-- @p09_mais_caros_que_todos
-- Esperado: 35 no total -- 20 confirmados e 15 com preco suspeito a confirmar, todos de Tenis
SELECT CASE WHEN possui_preco_suspeito THEN 'a confirmar' ELSE 'confirmado' END AS situacao,
       COUNT(*)                                            AS produtos,
       concat_ws(', ', sort_array(collect_set(categoria)))  AS categorias,
       SUM(COUNT(*)) OVER ()                               AS total_produtos
FROM   precos_competitividade
WHERE  classificacao_preco = 'MAIS_CARO_QUE_TODOS'
GROUP  BY possui_preco_suspeito
ORDER  BY situacao;

-- @p10_top10_mais_caros_que_a_media
-- Esperado: 5 -- Camisa Social, Persiana Vertical, Shorts Jeans, Vestido Floral, Notebook Inspiron 15
SELECT v.nome_produto,
       v.ranking_receita,
       p.diferenca_pct_vs_media,
       p.possui_preco_suspeito
FROM   vendas_produtos v
       JOIN precos_competitividade p ON p.id_produto = v.id_produto
WHERE  v.ranking_receita <= 10
  AND  p.diferenca_pct_vs_media > 0
ORDER  BY v.ranking_receita;

-- @ex_ticket_medio_por_segmento
-- SQL de exemplo do space. POR QUE: ticket medio e receita / numero de vendas, nunca media de
-- medias -- AVG(ticket_medio) daria outro numero.
SELECT segmento_cliente,
       COUNT(*)                                                AS clientes,
       SUM(total_compras)                                      AS vendas,
       SUM(receita)                                            AS receita,
       ROUND(SUM(receita) / SUM(total_compras), 2)              AS ticket_medio
FROM   clientes_segmentacao
GROUP  BY segmento_cliente
ORDER  BY receita DESC;

-- @ex_participacao_top_tier
-- SQL de exemplo do space. POR QUE: participacao e sempre sobre a receita TOTAL da empresa, que
-- inclui os outros segmentos -- o denominador nao pode sair do mesmo WHERE do numerador.
SELECT COUNT(*)                                                                       AS clientes_top_tier,
       SUM(receita)                                                                   AS receita_top_tier,
       ROUND(100 * SUM(receita) / (SELECT SUM(receita) FROM clientes_segmentacao), 1)  AS pct_da_receita
FROM   clientes_segmentacao
WHERE  segmento_cliente = 'TOP_TIER';

-- @ex_receita_por_regiao_e_categoria
-- SQL de exemplo do space. POR QUE vendas_detalhadas: e a unica gold que tem regiao (do cliente) e
-- categoria (do produto) na mesma linha; cruzar isso em outra tabela exigiria join na mao.
SELECT regiao,
       categoria,
       COUNT(*)                    AS vendas,
       SUM(receita)                AS receita,
       COUNT(DISTINCT id_cliente)  AS clientes
FROM   vendas_detalhadas
GROUP  BY regiao, categoria
ORDER  BY receita DESC
LIMIT  10;

-- @ex_mais_caros_que_a_media
-- SQL de exemplo do space. POR QUE uma linha por situacao: contagem de preco NUNCA sai num numero
-- so -- o diretor precisa saber quanto do total depende de confirmar a cotacao do concorrente, e
-- em que categoria esses produtos estao.
SELECT CASE WHEN possui_preco_suspeito THEN 'a confirmar' ELSE 'confirmado' END AS situacao,
       COUNT(*)                                             AS produtos,
       concat_ws(', ', sort_array(collect_set(categoria)))   AS categorias,
       SUM(COUNT(*)) OVER ()                                AS total_produtos
FROM   precos_competitividade
WHERE  diferenca_pct_vs_media > 0
GROUP  BY possui_preco_suspeito
ORDER  BY situacao;

-- @ini_comercial_hora
-- Pergunta inicial (Comercial). Nao pode voltar vazia.
SELECT hora, SUM(receita) AS receita, SUM(total_vendas) AS vendas
FROM   vendas_temporais
GROUP  BY hora
ORDER  BY receita DESC
LIMIT  5;

-- @ini_comercial_itens_categoria
-- Pergunta inicial (Comercial). Nao pode voltar vazia.
SELECT categoria, SUM(itens_vendidos) AS itens, SUM(receita) AS receita
FROM   vendas_produtos
GROUP  BY categoria
ORDER  BY itens DESC;

-- @ini_cs_top_tier_por_estado
-- Pergunta inicial (Customer Success). Nao pode voltar vazia.
SELECT estado, nome_estado, COUNT(*) AS clientes, SUM(receita) AS receita
FROM   clientes_segmentacao
WHERE  segmento_cliente = 'TOP_TIER'
GROUP  BY estado, nome_estado
ORDER  BY clientes DESC, receita DESC;

-- @ini_cs_ultima_compra
-- Pergunta inicial (Customer Success). Nao pode voltar vazia.
SELECT nome_cliente, estado, segmento_cliente, ultima_compra, receita
FROM   clientes_segmentacao
WHERE  ultima_compra IS NOT NULL
ORDER  BY ultima_compra ASC, receita DESC
LIMIT  10;

-- @ini_pricing_mais_baratos
-- Pergunta inicial (Pricing). Nao pode voltar vazia.
SELECT nome_produto, categoria, nosso_preco, preco_minimo_concorrentes, diferenca_pct_vs_minimo
FROM   precos_competitividade
WHERE  classificacao_preco = 'MAIS_BARATO_QUE_TODOS'
ORDER  BY diferenca_pct_vs_minimo ASC;

-- @ini_pricing_diferenca_por_categoria
-- Pergunta inicial (Pricing). Nao pode voltar vazia. Sem os suspeitos, porque preco a confirmar
-- distorce a media da categoria.
SELECT categoria,
       COUNT(*)                                AS produtos,
       ROUND(AVG(diferenca_pct_vs_media), 2)   AS diferenca_media_pp
FROM   precos_competitividade
WHERE  NOT possui_preco_suspeito
GROUP  BY categoria
ORDER  BY diferenca_media_pp DESC;

-- @aux_clientes_sem_compra
-- Auxiliar (nao vai para o space): confere se existe cliente com zero compras, porque isso decide
-- se uma pergunta inicial sobre cliente inativo voltaria vazia.
SELECT COUNT(*) AS clientes_sem_compra
FROM   clientes_segmentacao
WHERE  total_compras = 0;
