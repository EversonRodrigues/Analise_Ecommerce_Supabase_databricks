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
- **Nome de measure NUNCA pode ser o nome de uma coluna do dataset.** Para o motor do AI/BI os
  identificadores sao case-insensitive, entao a measure `Receita` sobre a coluna `receita` vira
  `SUM(Receita)` -- referencia a si mesma. Todo widget que usa essa measure quebra no navegador com
  `BAD_REQUEST: Circular reference detected in calculated field: receita`, e quebra tambem quem usa
  measure cuja expressao passa por aquela coluna (o `Ticket medio` herdou o problema). Nem
  `bundle validate` nem o deploy reclamam: esse erro so aparece renderizando. Por isso a measure aqui
  se chama **`Receita total`** e o `displayName` do encoding continua "Receita" -- o rotulo que o
  diretor le nao muda. O `valida_dashboards.py` passou a cobrar essa colisao.
- **Regra de negocio vai na MEASURE do dataset, nao em filtro.** Measure e reavaliada no
  agrupamento de cada widget, entao `Ticket medio = SUM(receita)/COUNT(id_venda)` nunca vira media
  de medias, e `AND NOT possui_preco_suspeito` embutido garante o recorte "confirmado" mesmo que o
  usuario mexa nos filtros. O `description` da measure e o equivalente do `COMMENT` da gold.
- Dimensao com ordem propria (dia da semana, segmento, classificacao de preco) se ordena com
  `scale.sort: {by: "custom-order", orderedValues: [...]}`, **nao** com rotulo prefixado. A primeira
  versao deste projeto usava `1. Domingo` ... `7. Sabado` e `1. VIP`: funcionava, mas sujava o eixo
  que o diretor le. Os `orderedValues` sao os valores exatos do dado, **com acento**
  (`Terça`, `Sábado`).
- Dia da semana se compara pela **media por dia** (`SUM(receita)/COUNT(DISTINCT data)`). O periodo
  tem 5 sabados e 5 domingos e so 4 de cada dia util -- pelo total o fim de semana ganha so por ter
  um dia a mais.
- KPI leva **`frame.description`** com o que o numero inclui ou exclui: numero sem recorte e numero
  sem contexto. Com descricao o card precisa de **altura 4** (com 3 o texto fica cortado) e de
  **titulo curto** -- o que o titulo repetia agora esta so na descricao ("Clientes VIP (receita a
  partir de R$ 22.000)" virou "Clientes VIP").
- Evento que explica um pico entra como **anotacao** (`annotations`, `type: vertical-line`): Natal e
  ano novo estao dentro do periodo e explicam a serie diaria do Comercial.
- Nos KPIs de cabecalho o numero sai **inteiro**, com 2 decimais exatas -- compactado
  ("R$ 974,08 mil") ele deixa de conferir com o BASELINE. A receita disso:
  `{"type": "number-plain", "abbreviation": "none", "decimalPlaces": {"type":"exact","places":2}}`
  mais `"formatTemplate": "R$ {{@formatted}}"`. Duas armadilhas ja pagas aqui:
  - `"type": "number"` **compacta por conta propria e ignora `abbreviation`** -- foi assim que
    "R$ 974,08 mil" apareceu depois de um ajuste que parecia inofensivo. Use `number-plain`.
  - `"type": "number-currency"` com `BRL` poe o simbolo **depois** do numero no locale deste
    workspace ("322,54 R$"), e o Vitrine DS pede `R$ 322,54`. Por isso o simbolo vem do
    `formatTemplate`, nao do tipo. Nos EIXOS o simbolo sai de vez: o titulo do eixo ja diz "(R$)".
  - O separador de milhar sai como **espaco** ("974 077,28") porque o idioma do workspace e
    Portugues de Portugal. Isso nao se controla pelo JSON -- e configuracao de usuario/workspace.
- **Nao use sparkline (`encodings.period`) em contador ligado a `MEASURE()`.** Testado: o contador
  para de reagregar e passa a exibir o ULTIMO periodo -- o KPI de receita mostrou "R$ 28,21 mil /
  Jan 11, 2026" no lugar dos R$ 974.077,28 do periodo. A skill `databricks-aibi-dashboards`
  recomenda sparkline, e ela esta certa no caso geral (campo com `SUM()` inline), mas aqui o
  cabecalho **tem** de bater com o `BASELINE.md`, e numero que muda de significado em silencio e
  pior do que a ausencia da tendencia.
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
- **O botao "Ask Genie" e `uiSettings.genieSpace`, nao um widget.** Genie nao tem `widgetType` e nao
  e campo de bundle: o botao nativo nasce de
  `uiSettings.genieSpace: {isEnabled: true, overrideId: "<space_id>", enablementMode: "ENABLED"}`
  dentro do `.lvdash.json`. A primeira versao deste projeto usava um widget de texto com link
  markdown para `/genie/rooms/<id>` -- funcionava, mas nao era o botao nativo; foi substituido. O
  `space_id` esta fixo nos tres arquivos e **muda em prod**; o `valida_dashboards.py` cobra que os
  tres citem o mesmo id e que nao sobre link markdown.

### Aparencia: Vitrine Design System

A identidade visual nao e escolha de quem mexe no dashboard: vem da skill **Vitrine Design System**
(`Skills/Vitrine Design System/`, tokens em `tokens/colors.css`). A parte mecanica -- quais campos de
tema existem, versao de cada widget, o que e permitido em `mappings` -- vem da skill
**databricks-aibi-dashboards** (`Skills/databricks-aibi-dashboards/`). Leia as duas antes de mexer em
cor, fonte ou copy.

- **`uiSettings.theme` e obrigatorio e identico nos tres dashboards** (o `valida_dashboards.py`
  compara campo por campo com `TEMA_ESPERADO`). Sem tema, o dashboard herda o default do workspace e
  a suite deixa de parecer a mesma empresa.
- Mapeamento dos tokens: canvas `--paper-50` / `--ink-950`; widget `--white` / `--ink-900`, com
  `widgetBorderColor` igual ao fundo (o DS usa sombra, nao traco); fonte `--ink-900` / `--ink-50`;
  `widgetCornerRadius: 20` (raio de card do DS); `fontFamily: Figtree` (a unica fonte do DS -- o
  servidor aceita e devolve o valor).
- `selectionColor` e `--lime-700` no claro e `--lime-500` no escuro. O acento do DS e o lime-500,
  mas `#C6F432` sobre branco nao tem contraste para link/selecao; no fundo ink o lime-500 volta.
- `visualizationColors` caminha por **matizes** do DS (navy, azul, verde, lime, ambar, cinza-azul),
  nunca uma rampa de um matiz so -- adjacentes de mesma matiz o leitor nao distingue. O vermelho
  `--danger-500` fica **fora** da paleta de proposito: no DS ele e reservado a alerta/desconto.
- Cor com significado vai **pinada** em `color.scale.mappings`, com **hex puro** (`themeColorType` e
  `{"hex": ...}` sao descartados em silencio nesse campo) e so com token do DS -- o validador tem a
  lista. Hoje: E-commerce em ink e loja fisica em azul; VIP no lime (o acento), TOP_TIER em ink (o
  maior bloco de receita) e REGULAR em cinza; "preco a confirmar" em ambar.
- `mappings` mora em `color.scale`, nunca no `scale` do eixo x/y -- mappings no eixo nao e forma
  suportada (ja tentei; o servidor guarda e o grafico ignora).
- Contador **nao aceita cor por widget** (`value.color` faz o widget virar "unsupported widget
  definition"): a cor do numero vem do `fontColor` do tema.
- **A marca aparece em tres lugares**: o wordmark liderando o titulo, a barra de rodape
  (`rodape_marca`, ultima linha de cada pagina) e o `display_name` do recurso
  (`Vitrine · <diretoria>`, que e o nome na lista do workspace e na aba do navegador).
- **O wordmark e um SVG em data URI, nao texto** -- `# ![vitrine.](data:image/svg+xml;base64,...)
  · <diretoria>`. Testado no navegador: o textbox do AI/BI aceita imagem em data URI, e e a unica
  forma de ter o **ponto em lime** (`--lime-500`), porque markdown nao colore caractere e HTML
  inline nao e opcao. Tres detalhes que custaram uma rodada cada:
  - a faixa do titulo precisa de **altura 2**; com 1 a imagem de ~56px e cortada junto com o texto;
  - dimensione o SVG para casar com o H1 ao lado (hoje `font-size: 44` num canvas de 56px de
    altura) -- a imagem entra no tamanho intrinseco dela, entao um SVG pequeno fica visivelmente
    menor que o titulo;
  - aperte a **largura** do canvas ate o fim do texto (178px), senao sobra um vao dentro da imagem
    que parece espacamento acidental.
  O SVG declara `font-family: Figtree, 'Segoe UI', ...`, mas atencao: `<img>` com data URI **nao**
  herda a fonte da pagina -- so usa fonte instalada no sistema de quem abre. Ou seja, o wordmark
  cai no fallback em maquina sem Figtree; o resto do dashboard continua em Figtree pelo tema.
- **Copy e interface, nao codigo.** Titulo de widget, rotulo de eixo, coluna de tabela, descricao de
  KPI/measure e bloco de insight vao em **portugues com acento**, sentence case, sem enfase em CAIXA
  ALTA (use negrito) e tratando quem le por **voce**. A convencao "sem acento" deste repo vale para
  SQL, nome de coluna, nome de campo e mensagem de commit -- e ja vazou uma vez para a copy. O
  `valida_dashboards.py` cobra: ele varre tudo que e texto para humano e recusa palavra sem acento e
  caps de enfase, pulando as chaves que sao codigo.

### Genie space (prompt_06)

- Um space para as tres diretorias: `src/genie/diretoria_ecommerce.geniespace.json` (o serialized
  space) e o recurso em `resources/diretoria.genie_space.yml`. O placar das rodadas de teste fica em
  `src/genie/PLACAR.md`.
- O recurso e `resources.genie_spaces` e o campo do nome e **`title`**, nao `display_name` (que e o
  do dashboard). `parent_path` e **imutavel**: mudar recria o space, o que gera um `space_id` novo --
  e o `space_id` esta fixo nos 3 dashboards.
- Os nomes de tabela no JSON sao **qualificados com o catalogo** (`projetoecomerce.gold.<tabela>`),
  ao contrario de todo o resto do repo: o `.geniespace.json` nao passa por variaveis do bundle.
  Inofensivo aqui (mesmo catalogo em dev e prod, gold sempre em `gold`), mas parece fora do padrao.
- **O schema do `serialized_space` v2 e fechado e o servidor recusa campo desconhecido pelo nome**
  (descoberto mandando campo por campo). O que existe: `version`, `config.sample_questions[{id,
  question[]}]`, `data_sources.tables[{identifier, description[]?}]`,
  `instructions.text_instructions[{id, content[]}]`,
  `instructions.example_question_sqls[{id, question[], sql[]}]` e
  `instructions.sql_snippets.{measures,expressions}[{id, display_name, sql[]}]` -- em `sql_snippets`
  o `display_name` e **string**, nao lista. **Nao existe campo para join nem para sinonimo de
  coluna**: os dois vao no texto das instrucoes. `columns` dentro de `tables` tambem nao existe.
- Duas regras do servidor que so aparecem no deploy, e que por isso o `valida_genie.py` checa:
  `data_sources.tables` tem de estar **ordenado por identifier**, e cada lista de instrucao/pergunta
  **ordenada por id**. Por isso os ids deste projeto sao `<ordinal de 2 digitos> + 30 chars de md5`:
  assim a ordem exigida pelo servidor e a ordem de leitura do arquivo.
- Listas de texto (`content`, `sql`, `question`) sao concatenadas **sem separador**, igual a
  `queryLines` dos dashboards: cada elemento termina em `\n`.
- Instrucoes gerais: teto de **2.500 caracteres**, e so regra que **nao cabe num `COMMENT`**. Os 70
  comentarios da gold ja dizem unidade e regra de calculo; repetir aqui gasta o orcamento.
- Regra que falha em texto costuma passar como **SQL de exemplo**. Mas o exemplo nao pode repetir
  pergunta do teste de aceitacao, senao o teste vira cola -- quando precisou ensinar
  "pergunta por regiao traz o numero de clientes", a mudanca entrou no exemplo de *outra* pergunta
  (receita por regiao e categoria). Historico em `PLACAR.md`.
- Nada de ajustar pela interface: o proximo `deploy` sobrescreve. Para manter,
  `databricks genie get-space <id> --include-serialized-space -o json` ou
  `databricks bundle generate genie-space --resource diretoria_ecommerce --force`, e trazer o diff.
- O botao "Ask Genie" dos dashboards **nao e campo de bundle** (`resources.Dashboard` nao tem nada
  de Genie) e **nao e widget** (nao existe `widgetType` de Genie): e
  `uiSettings.genieSpace: {isEnabled, overrideId, enablementMode}` dentro do `.lvdash.json`. O id e o
  de **dev** e muda em prod; o `valida_dashboards.py` exige que os 3 arquivos citem o mesmo id.

### Testes do Genie space

- `python testes/valida_genie.py` antes de todo deploy: schema, ordem exigida pelo servidor, teto de
  caracteres, as 5 golds como unica fonte, `\n` no fim de cada linha e padroes proibidos **no SQL**
  (no texto os mesmos padroes aparecem de proposito, como proibicao).
- `python testes/placar_genie.py` depois do deploy: as 10 perguntas do enunciado + as 2 de limite,
  uma conversa nova por pergunta, com o esperado saindo de `testes/sql/genie_gabarito.sql` rodado na
  hora (se o gabarito divergir, o script acusa o dado, nao o Genie). Placar atual: **10/10 + 2/2**.
- Quando errar, **nao mude o esperado**: mude o contexto do space e registre a rodada no
  `PLACAR.md`.

### Testes dos dashboards

- **`databricks bundle validate --strict` NAO valida o conteudo do `.lvdash.json`.** Ele le o
  arquivo (falha se nao existir) e valida o YAML, mas JSON valido com `widgetType` errado,
  `fieldName` inexistente ou `datasetName` com typo deploya limpo e quebra so no navegador.
  "Deploy passou" nao e evidencia de nada.
- Rode `python testes/valida_dashboards.py` antes de todo deploy: ele cobre essa lacuna
  (referencias cruzadas, measures inexistentes, sobreposicao no grid, encoding sem BOM, padroes
  proibidos, a regra do `\n` nos textos, o tema do Vitrine DS campo por campo, cor pinada fora dos
  tokens, o `uiSettings.genieSpace` dos tres, e copy sem acento ou em caps).
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
