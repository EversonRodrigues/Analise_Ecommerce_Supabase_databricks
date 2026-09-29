# Declarative Automation Bundles Project

This project uses Declarative Automation Bundles (DABs) for deployment. Add project-specific instructions below.

## For AI Agents: Use Databricks AI Tools

**BEFORE any other action, read the `databricks-core` skill.**

It sets you up to work with this project reliably: CLI authentication, profile
selection, data discovery, and the bundle deployment workflow. Without it,
results are often slower and less accurate.

If this skill is not available (Databricks AI Tools are not installed), you can install them for your coding agent in seconds:

```bash
databricks aitools install
```

If the CLI is not installed, see: https://docs.databricks.com/dev-tools/cli/install

---

## Project Instructions

### Nomes do ambiente

- Catalogo: `projetoecomerce`. Schemas: `bronze`, `silver`, `gold`. Nunca use outro catalogo.
- Perfil de CLI: `AnaliseEcommerce` (`-p AnaliseEcommerce` em todo comando `databricks`).
- Obs.: o enunciado original (`.llm/prompt_01.md`) fala em catalogo `projetoaovivo` e perfil
  `imersao`. Nenhum dos dois existe neste workspace; os nomes acima sao os equivalentes reais.
- Obs.: o `.llm/prompt_05.md` manda dizer no eixo que "data e hora estao em UTC (veja o comentario
  da coluna)". **O comentario da coluna nao diz isso**: nenhuma das 70 colunas da gold menciona
  fuso -- `data_venda TIMESTAMP` diz so "Data e hora exatas da venda" e `hora INT` diz so "de 0 a
  23". O fuso e premissa do enunciado sem respaldo no catalogo, entao os dashboards rotulam
  "hora do registro da venda" em vez de afirmar UTC. Se o fuso for confirmado na origem,
  acrescente a nota ao `COMMENT` de `hora` em `vendas_temporais.sql` e `vendas_detalhadas.sql`
  (mudanca so de comentario) e ai sim rotule os eixos.

### Convencoes de codigo

- Nomes de tabelas e colunas em portugues, snake_case, sem acento.
- Silver em Python (`from pyspark import pipelines as dp`), gold em SQL.
- Um arquivo por tabela: `src/projeto_ecommerce_etl/transformations/silver/<tabela>.py` e
  `src/projeto_ecommerce_etl/transformations/gold/<tabela>.sql`.
- Cada arquivo comeca com comentarios explicando o PORQUE das regras, em portugues.
- Dinheiro sempre `DECIMAL(10,2)`.
- Nomes no codigo sempre `schema.tabela`, sem catalogo (o catalogo vem do pipeline).

### Modelagem

- Todas as tabelas sao **materialized views** com leitura **batch** (`spark.read.table`), nunca
  streaming table: a bronze e sobrescrita a cada execucao, e streaming exige fonte append-only.
- Pipeline serverless, catalogo `projetoecomerce`, schema padrao `silver`. As golds sao publicadas
  com nome qualificado `gold.<tabela>`.

### Qualidade de dados

- Problema de qualidade **conhecido** e MARCADO em uma coluna e MEDIDO com `@dp.expect` (warn).
  Nunca descarte linhas: apagar vendas mudaria a receita.
- `@dp.expect_all_or_fail` so para o que nunca pode acontecer (chave nula, preco <= 0, dominio
  fechado de `canal_venda`).
- Nao use `@dp.expect_or_drop` neste projeto.

### Regras para toda gold (valem para as proximas diretorias)

- SQL, um arquivo por tabela em `transformations/gold/`, com
  `CREATE OR REFRESH MATERIALIZED VIEW gold.<tabela>`. Nunca `CREATE OR REPLACE`.
- Declare **todas** as colunas entre parenteses, cada uma com **tipo e `COMMENT`**. Sem o tipo
  declarado, o Databricks ignora o comentario silenciosamente.
- `COMMENT` na tabela dizendo **quando usar** a tabela.
- Comentarios em portugues, sempre com: unidade (R$), regra de calculo e avisos que evitem erro do
  Genie (o que significa zero, o que significa nulo, quais valores uma coluna categorica assume,
  o que a coluna NAO e).
- Inclua **todas** as vendas, inclusive de produto nao cadastrado: dinheiro que entrou e receita.
- Periodo dos dados: **13/12/2025 a 11/01/2026**. Cite nos comentarios, para o Genie nao inventar
  resposta sobre meses que nao existem.
- Toda gold nova ganha testes em `testes/testes_qualidade.py`.
- Nao declare o schema como `resources.schemas` no bundle: em `mode: development` o DABs prefixa o
  nome e o schema viraria `dev_<usuario>_gold`, enquanto o codigo continuaria escrevendo em `gold`.
  Nao e preciso: o proprio pipeline cria o schema de destino que ainda nao existe (o catalogo, sim,
  precisa pre-existir). Se algum dia for necessario declarar, use
  `experimental: { skip_name_prefix_for_schema: true }`.

### Dashboards AI/BI (prompt_05)

- Um arquivo por dashboard em `src/dashboards/<nome>.lvdash.json`, recurso em
  `resources/<nome>.dashboard.yml`. **A extensao e `.lvdash.json`**, nao `.ERSdash.json` como diz
  o enunciado: `lvdash` e a convencao real (o schema da CLI diz que "exported dashboards always
  have the file extension .lvdash.json"); `ERSdash` nao existe no Databricks.
- `warehouse_id` vem da variavel do bundle com `lookup: {warehouse: Serverless Starter Warehouse}`.
  E o unico `lookup` do repo; ele acopla `bundle validate` a existencia do warehouse.
- Consultas com o nome da tabela **sem catalogo e sem schema** (`FROM vendas_detalhadas`).
  `dataset_catalog`/`dataset_schema` do YAML sao injetados pelo servidor como `catalog`/`schema`
  de cada dataset -- conferido comparando o JSON enviado com o `lakeview get`. `dataset_schema` e o
  literal `gold`, nunca `${var.schema}` (que e `silver` em dev e `prod` em prod).
- **Nenhum dashboard le `gold.vendas_temporais`**: ela e esparsa (ausencia = zero, nao nulo) e traz
  `clientes_unicos`, que nao pode ser somado. `vendas_detalhadas` da os mesmos graos no grao da
  venda, onde `COUNT(*)` e `COUNT(DISTINCT id_cliente)` estao certos por construcao.
- **Regra de negocio vai na MEASURE do dataset, nao em filtro.** Measure e reavaliada no
  agrupamento de cada widget, entao `Ticket medio = SUM(receita)/COUNT(id_venda)` nunca vira media
  de medias, e `AND NOT possui_preco_suspeito` embutido garante o recorte "confirmado" mesmo que o
  usuario mexa nos filtros. O `description` da measure e o equivalente do `COMMENT` da gold.
- Dia da semana: ordenar por rotulo prefixado (`1. Domingo` ... `7. Sabado`) e comparar pela
  **media por dia** (`SUM(receita)/COUNT(DISTINCT data)`). O periodo tem 5 sabados e 5 domingos e
  so 4 de cada dia util -- pelo total o fim de semana ganha so por ter um dia a mais.
- Nos KPIs de cabecalho use `"abbreviation": "none"` com 2 decimais exatas. Com `compact`,
  R$ 974.077,28 vira "R$ 974,08 mil" e o numero deixa de conferir com o BASELINE.
- `diferenca_pct_*` da gold esta em **pontos percentuais** (10 = 10%) e `number-percent` multiplica
  por 100: leve uma coluna `.../100` no SQL se for formatar como porcentagem.
- **`multilineTextboxSpec.lines[]` e concatenado SEM separador**, igual a `queryLines`: cada
  elemento precisa terminar em `\n`, e separador de paragrafo e um elemento `"\n"` (string vazia e
  descartada). Sem isso os paragrafos vem grudados num bloco unico. Descoberto comparando o
  enviado com o devolvido pelo servidor.
- Grid de **12 colunas**, `x + width <= 12`, sem auto-layout: toda coordenada e calculada a mao e
  sobreposicao nao e recusada, so renderiza embolado.
- Em `mode: development` o display_name **e** prefixado (`[dev <usuario>] Diretoria Comercial`).
  Em prod sai limpo. Inofensivo: dev e prod ficam em pastas diferentes.
- `bundle deploy` **tambem publica** o dashboard (confirmado com `lakeview get-published`).
- Editar pela interface e descartavel: o proximo `deploy` sobrescreve. Para manter, exporte com
  `databricks lakeview get <id> -o json` e traga o diff de volta para o arquivo.
- Quando o Genie space do prompt_06 existir, o id dele entra fixo no JSON do dashboard para ligar o
  botao "Ask Genie" -- e muda entre dev e prod.

### Testes dos dashboards

- **`databricks bundle validate --strict` NAO valida o conteudo do `.lvdash.json`.** Ele le o
  arquivo (falha se nao existir) e valida o YAML, mas JSON valido com `widgetType` errado,
  `fieldName` inexistente ou `datasetName` com typo deploya limpo e quebra so no navegador.
  "Deploy passou" nao e evidencia de nada.
- Rode `python testes/valida_dashboards.py` antes de todo deploy: ele cobre essa lacuna
  (referencias cruzadas, measures inexistentes, sobreposicao no grid, encoding sem BOM, padroes
  proibidos, e a regra do `\n` nos textos).
- Prove o SQL de cada dataset no warehouse **antes** de escrever JSON, e confronte cada measure
  expandida com o `BASELINE.md`.
- Depois do deploy, confira que o servidor guardou o que voce escreveu:
  `databricks lakeview get <id> -o json` e compare o `serialized_dashboard` com o arquivo. A unica
  diferenca esperada e o `catalog`/`schema` que o YAML injeta.

### Fluxo de trabalho

- Sempre rode `databricks bundle validate --strict -p AnaliseEcommerce` antes do deploy.
- Deploy em dev: `databricks bundle deploy -t dev -p AnaliseEcommerce`.
- Valide o grafo antes do run real: `databricks bundle run projeto_ecommerce_etl --validate-only
  -t dev -p AnaliseEcommerce`. Isso checa SQL, tipos e ciclos sem materializar tabela nenhuma.
- Execucao: `databricks bundle run pipeline_ecommerce -t dev -p AnaliseEcommerce`.
- O `display()` do notebook de testes NAO aparece no output do job. Para ver o quadro dos testes,
  extraia a lista `TESTES` de `testes/testes_qualidade.py` e rode as consultas no warehouse.

### Numeros de referencia

Os volumes, totais de receita e contagens esperadas ficam em `BASELINE.md`, importado abaixo.
Confira o resultado do job contra ele: divergencia sem mudanca na bronze e regressao.

@BASELINE.md
