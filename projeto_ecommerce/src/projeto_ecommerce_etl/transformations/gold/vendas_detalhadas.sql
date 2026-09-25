-- gold.vendas_detalhadas -- uma linha por venda, com tudo que as diretorias precisam cruzar.
--
-- POR QUE existe uma gold no mesmo grao da silver:
--   Nao e duplicacao. silver.vendas so tem ids; responder "receita por regiao e categoria" ou
--   "canal preferido dos VIPs" exigiria tres joins escritos na mao a cada pergunta. O Genie erra
--   joins, e o dashboard precisa de filtros cruzados baratos. Esta tabela paga o join uma vez,
--   na atualizacao, e entrega os atributos ja prontos ao lado da venda.
--
-- POR QUE os dois joins sao LEFT:
--   Nenhuma venda pode sumir. A venda de produto fora do catalogo (20 delas, R$ 4.240,01) tem de
--   continuar aqui, senao a receita desta gold para de fechar com a da silver -- e e exatamente
--   isso que o teste de qualidade verifica. Trocar por INNER JOIN quebraria o teste na hora.
--
-- POR QUE cliente e segmento vem de gold.clientes_segmentacao e nao de silver.clientes:
--   O segmento so existe na gold, e tirar nome/estado/regiao da mesma fonte garante que o
--   dashboard mostre o mesmo valor nas duas telas. Isso cria uma dependencia gold -> gold dentro
--   do pipeline; o grafo resolve a ordem sozinho, como ja faz entre as silver.
--
-- POR QUE CLUSTER BY (data):
--   Data e o filtro natural do dashboard da Diretoria Comercial. Com 30 dias de dados o ganho e
--   pequeno, mas a intencao fica declarada e passa a valer quando a base crescer.

CREATE OR REFRESH MATERIALIZED VIEW gold.vendas_detalhadas (
  id_venda STRING COMMENT
    'Identificador unico da venda. Uma linha por venda -- e a chave desta tabela.',
  data_venda TIMESTAMP COMMENT
    'Data e hora exatas da venda.',
  data DATE COMMENT
    'Data da venda (sem hora). Periodo coberto: 13/12/2025 a 11/01/2026.',
  dia_semana STRING COMMENT
    'Nome do dia da semana em portugues. Assume exatamente um de: Domingo, Segunda, Terca, Quarta, Quinta, Sexta, Sabado.',
  dia_semana_num INT COMMENT
    'Numero do dia da semana, 1 = Domingo ate 7 = Sabado. Use para ordenar os dias na ordem certa, porque a ordem alfabetica de dia_semana fica errada.',
  hora INT COMMENT
    'Hora do dia da venda, de 0 a 23.',
  canal_venda STRING COMMENT
    'Canal da venda. Assume exatamente um de: ecommerce ou loja_fisica.',
  id_produto STRING COMMENT
    'Identificador do produto vendido. Use este campo, e nao nome_produto, para contar ou agrupar produtos.',
  nome_produto STRING COMMENT
    'Nome do produto. ATENCAO: o nome NAO e unico -- produtos diferentes compartilham o mesmo nome. Vale "Produto nao cadastrado" quando o produto nao existe no catalogo.',
  categoria STRING COMMENT
    'Categoria do produto, ex.: Moda, Audio, Casa. Vale "Nao cadastrado" quando o produto nao existe no catalogo.',
  marca STRING COMMENT
    'Marca do produto. Vale "Nao cadastrado" quando o produto nao existe no catalogo.',
  faixa_preco STRING COMMENT
    'Faixa de preco do produto no catalogo: PREMIUM (preco acima de R$ 1.000), MEDIO (acima de R$ 500) ou BASICO. Vale "Nao cadastrado" quando o produto nao existe no catalogo.',
  id_cliente STRING COMMENT
    'Identificador do cliente que comprou.',
  nome_cliente STRING COMMENT
    'Nome do cliente, ja sem pronome de tratamento e em formato titulo.',
  estado STRING COMMENT
    'Sigla da unidade federativa (UF) do cliente, ex.: SP, MG, AC.',
  regiao STRING COMMENT
    'Regiao do IBGE do cliente. Assume exatamente um de: Norte, Nordeste, Centro-Oeste, Sudeste, Sul.',
  segmento_cliente STRING COMMENT
    'Segmento de valor do cliente, vindo de gold.clientes_segmentacao. Assume exatamente um de: VIP (receita a partir de R$ 22.000 no periodo), TOP_TIER (R$ 17.000 a R$ 21.999,99) e REGULAR (abaixo de R$ 17.000). ATENCAO: o segmento e do CLIENTE no periodo inteiro, nao desta venda.',
  quantidade BIGINT COMMENT
    'Quantidade de unidades do produto nesta venda. Sempre maior que zero.',
  preco_unitario DECIMAL(10,2) COMMENT
    'Preco pago por unidade nesta venda, em reais (R$). E o preco da transacao, que pode diferir do preco atual do catalogo.',
  receita DECIMAL(10,2) COMMENT
    'Receita desta venda, em reais (R$). Calculo: quantidade x preco_unitario. Somavel entre linhas: a soma de toda a tabela fecha com a receita total da empresa no periodo.',
  produto_cadastrado BOOLEAN COMMENT
    'Indica se o produto vendido existe no catalogo. false significa venda de produto fora do catalogo: a receita e real e esta contabilizada, o que falta e o cadastro. Sao 20 vendas nessa situacao.',
  venda_antes_do_cadastro BOOLEAN COMMENT
    'Indica que a venda aconteceu ANTES da data de criacao do produto no catalogo, o que e impossivel e denuncia erro de data na origem. Sao 5 vendas nessa situacao. Vale false quando o produto nao esta cadastrado, porque nesse caso nao ha data de criacao para comparar.'
)
CLUSTER BY (data)
COMMENT
  'Vendas no maior nivel de detalhe, uma linha por venda, com os atributos de produto e de cliente ja resolvidos ao lado. Use esta tabela para perguntas que CRUZAM diretorias -- receita por regiao e categoria, canal preferido dos clientes VIP, produto mais vendido no Sudeste -- e para os filtros cruzados do dashboard. Tem exatamente as mesmas 3.020 linhas de silver.vendas: nenhuma venda e descartada, nem as de produto fora do catalogo. Valores monetarios em reais (R$). Periodo coberto: 13/12/2025 a 11/01/2026; nao ha dados fora desse intervalo. Para agregados por tempo use gold.vendas_temporais, por produto use gold.vendas_produtos e por cliente use gold.clientes_segmentacao -- sao mais baratas quando a pergunta nao precisa do detalhe.'
AS
SELECT
  v.id_venda,
  v.data_venda,
  v.data,
  v.dia_semana,
  v.dia_semana_num,
  v.hora,
  v.canal_venda,
  v.id_produto,
  COALESCE(pr.nome_produto, 'Produto não cadastrado') AS nome_produto,
  COALESCE(pr.categoria, 'Não cadastrado') AS categoria,
  COALESCE(pr.marca, 'Não cadastrado') AS marca,
  COALESCE(pr.faixa_preco, 'Não cadastrado') AS faixa_preco,
  v.id_cliente,
  cs.nome_cliente,
  cs.estado,
  cs.regiao,
  cs.segmento_cliente,
  v.quantidade,
  v.preco_unitario,
  v.receita,
  v.produto_cadastrado,
  v.venda_antes_do_cadastro
FROM silver.vendas v
LEFT JOIN silver.produtos pr
  ON pr.id_produto = v.id_produto
LEFT JOIN gold.clientes_segmentacao cs
  ON cs.id_cliente = v.id_cliente
