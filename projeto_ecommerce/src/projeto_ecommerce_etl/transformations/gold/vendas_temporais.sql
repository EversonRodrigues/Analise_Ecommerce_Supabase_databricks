-- gold.vendas_temporais -- quando vendemos, para a Diretoria Comercial.
--
-- POR QUE o grao e data x hora x canal_venda:
--   E a menor combinacao que responde as tres perguntas da diretora de uma vez: quanto vendemos,
--   em que momento e por qual canal. Agregar mais (so por dia) perde o padrao de horario;
--   agregar menos e voltar para silver.vendas.
--
-- POR QUE dia_semana e dia_semana_num entram no GROUP BY:
--   Sao funcionalmente determinados por data -- nao mudam o grao, so viajam junto. Ficam na
--   tabela para o dashboard agrupar por dia da semana sem precisar recalcular.
--
-- POR QUE clientes_unicos NAO pode ser somado entre linhas:
--   O mesmo cliente compra em horas e canais diferentes e aparece em varias linhas. Somando as
--   908 linhas desta tabela da 2.902 "clientes"; os reais sao 50. O comentario da coluna avisa
--   isso e aponta para gold.clientes_segmentacao, que tem a contagem certa do periodo.
--
-- POR QUE a tabela e esparsa (e por que isso esta escrito no COMMENT):
--   Sao 30 dias x 18 horas x 2 canais = 1.080 combinacoes possiveis, mas so 908 existem. Hora sem
--   venda simplesmente nao tem linha. Sem esse aviso o Genie responde "nao ha dados" para uma
--   pergunta cuja resposta certa e "zero".

CREATE OR REFRESH MATERIALIZED VIEW gold.vendas_temporais (
  data DATE COMMENT
    'Data da venda (sem hora). Periodo coberto: 13/12/2025 a 11/01/2026.',
  dia_semana STRING COMMENT
    'Nome do dia da semana em portugues. Assume exatamente um de: Domingo, Segunda, Terca, Quarta, Quinta, Sexta, Sabado.',
  dia_semana_num INT COMMENT
    'Numero do dia da semana, 1 = Domingo ate 7 = Sabado. Use para ordenar os dias na ordem certa, porque a ordem alfabetica de dia_semana fica errada.',
  hora INT COMMENT
    'Hora do dia da venda, de 0 a 23. So aparecem as horas em que houve venda.',
  canal_venda STRING COMMENT
    'Canal da venda. Assume exatamente um de: ecommerce ou loja_fisica.',
  total_vendas BIGINT COMMENT
    'Quantidade de vendas (pedidos) nesta data, hora e canal. Somavel entre linhas.',
  itens_vendidos BIGINT COMMENT
    'Soma das quantidades dos itens vendidos nesta data, hora e canal. E maior que total_vendas porque uma venda pode levar varios itens. Somavel entre linhas.',
  receita DECIMAL(10,2) COMMENT
    'Receita nesta data, hora e canal, em reais (R$). Calculo: soma de quantidade x preco_unitario. Inclui vendas de produto nao cadastrado. Somavel entre linhas: a soma de toda a tabela fecha com a receita total da empresa no periodo.',
  clientes_unicos BIGINT COMMENT
    'Clientes distintos que compraram nesta data, hora e canal. ATENCAO: NAO some esta coluna entre linhas -- o mesmo cliente aparece em varias linhas e a soma da 2.902 quando os clientes reais sao 50. Para clientes unicos no periodo, use gold.clientes_segmentacao.'
)
COMMENT
  'Vendas agregadas por data, hora e canal, para a Diretoria Comercial. Use esta tabela para responder quanto vendemos, em que dia e horario, em qual dia da semana e por qual canal -- padroes de sazonalidade e pico de demanda. Uma linha por combinacao data x hora x canal_venda. ATENCAO: a tabela e esparsa -- combinacao sem venda NAO tem linha, e a ausencia significa zero venda, nao dado faltante. Valores monetarios em reais (R$). Periodo coberto: 13/12/2025 a 11/01/2026; nao ha dados fora desse intervalo. A receita desta tabela fecha exatamente com a de silver.vendas. Para clientes unicos no periodo use gold.clientes_segmentacao; para detalhe venda a venda use gold.vendas_detalhadas.'
AS
SELECT
  data,
  dia_semana,
  dia_semana_num,
  hora,
  canal_venda,
  COUNT(*) AS total_vendas,
  SUM(quantidade) AS itens_vendidos,
  CAST(SUM(receita) AS DECIMAL(10,2)) AS receita,
  COUNT(DISTINCT id_cliente) AS clientes_unicos
FROM silver.vendas
GROUP BY
  data,
  dia_semana,
  dia_semana_num,
  hora,
  canal_venda
