# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Onde ficam as instrucoes detalhadas

Este repositorio e um envelope para um unico Databricks Asset Bundle: `projeto_ecommerce/`.
- `projeto_ecommerce/AGENTS.md` -- convencoes de codigo, modelagem, qualidade de dados, regras de
  gold e fluxo de trabalho. Importado por `projeto_ecommerce/CLAUDE.md`. **Leia antes de tocar em
  qualquer transformacao**: e a fonte da verdade sobre catalogo, perfil de CLI e como escrever uma
  gold neste projeto.
- `projeto_ecommerce/BASELINE.md` -- os **numeros de referencia**: volumes por tabela, receita
  total, contagens dos problemas de qualidade conhecidos. Separado de proposito, porque e o unico
  arquivo de instrucoes que muda quando a bronze muda. Importado pelo AGENTS.md.

`.llm/prompt_01.md` ... `prompt_06.md` sao os enunciados originais do exercicio, na ordem em que o
projeto foi construido (silver, gold CS, gold Comercial, gold Pricing, dashboards, Genie space).
Eles citam catalogo `projetoaovivo` e perfil `imersao`, que **nao existem** neste workspace; os
nomes reais estao no AGENTS.md. O prompt_05 esta implementado em `src/dashboards/` (3 dashboards
AI/BI, com extensao `.lvdash.json` e nao `.ERSdash.json` -- veja a secao de dashboards do
AGENTS.md). O prompt_06 (Genie space) ainda nao: nao existe `src/genie/`.

## Comandos

Todos os comandos `databricks` rodam **de dentro de `projeto_ecommerce/`** (raiz do bundle) e
sempre com o perfil `-p AnaliseEcommerce`:

```bash
cd projeto_ecommerce
databricks bundle validate --strict -p AnaliseEcommerce            # sempre antes do deploy
databricks bundle deploy -t dev -p AnaliseEcommerce
databricks bundle run projeto_ecommerce_etl --validate-only -t dev -p AnaliseEcommerce   # checa SQL/tipos/ciclos sem materializar
databricks bundle run pipeline_ecommerce -t dev -p AnaliseEcommerce # job completo: silver+gold e depois os testes
```

Rodar uma unica transformacao (equivalente a um "teste unitario" aqui):

```bash
databricks bundle run projeto_ecommerce_etl --refresh silver.vendas -t dev -p AnaliseEcommerce
```

Os testes de qualidade sao um notebook (`projeto_ecommerce/testes/testes_qualidade.py`), nao
pytest: rodam como segunda task do job `pipeline_ecommerce`. Para inspecionar um teste isolado,
copie a consulta da lista `TESTES` e rode no warehouse -- o `display()` do notebook **nao**
aparece no output do job.

Os dashboards tem validacao propria, que **precisa** rodar antes do deploy porque a CLI nao valida
o conteudo do `.lvdash.json`:

```bash
python testes/valida_dashboards.py
```

Para rodar SQL no warehouse: o MCP do Databricks responde 401 aqui (token nao enviado); use a CLI,
que autentica pelo perfil. E passe o SQL por **arquivo**, nunca por `echo` -- o shell deste
ambiente mangla acento, e `'Tênis'` sem acento casa zero linhas em silencio:

```bash
databricks api post /api/2.0/sql/statements -p AnaliseEcommerce --json '{
  "warehouse_id": "47307f0445a667ac", "catalog": "projetoecomerce", "schema": "gold",
  "wait_timeout": "50s", "statement": "SELECT ..." }'
```

## Arquitetura

Medalhao bronze -> silver -> gold em um unico Lakeflow Declarative Pipeline serverless
(`resources/projeto_ecommerce_etl.pipeline.yml`), catalogo `projetoecomerce`.

- **bronze** -- nao e gerada aqui. Outro processo **sobrescreve** as 4 tabelas
  (`vendas`, `produtos`, `clientes`, `preco_competidores`) em horario que este projeto nao
  controla. E por isso que tudo aqui e materialized view com `spark.read.table` (batch) e nunca
  streaming table, e por isso que o job **nao tem trigger agendado**.
- **silver** (`src/projeto_ecommerce_etl/transformations/silver/*.py`, PySpark,
  `from pyspark import pipelines as dp`) -- limpa, deduplica e **marca** problemas de qualidade em
  colunas booleanas, medindo-os com `@dp.expect` (warn). Nunca descarta linha: venda apagada e
  receita perdida. `@dp.expect_all_or_fail` so para violacao de contrato da origem.
- **gold** (`transformations/gold/*.sql`, uma tabela por diretoria) -- consumida por dashboard
  AI/BI e pelo Genie, entao cada coluna carrega tipo + `COMMENT` explicando unidade, regra de
  calculo e armadilhas (o que significa zero/nulo, o que nao somar).
- **testes** (`testes/testes_qualidade.py`) -- roda **depois** do pipeline, sobre o que foi
  publicado, cruzando tabelas; e a checagem que as expectations (que olham uma tabela por vez,
  durante a escrita) nao conseguem fazer.

Dependencias entre camadas sao implicitas, pelo nome da tabela no `spark.read.table` /
`FROM`: o pipeline resolve o grafo. Ex.: `silver.vendas` le `silver.produtos` para detectar venda
de produto nao cadastrado; `gold.vendas_detalhadas` le `gold.clientes_segmentacao`.

O schema padrao do pipeline e `silver` (variavel `schema` no `databricks.yml`); as golds se
publicam com nome qualificado `gold.<tabela>` no proprio codigo. Nomes nunca incluem o catalogo --
ele vem do pipeline, o que deixa o mesmo codigo valido em dev e prod.

## Pegadinhas deste projeto

- `mode: development` faz o DABs prefixar nomes de recursos. Por isso o schema **nao** e declarado
  em `resources.schemas` (viraria `dev_<usuario>_gold` enquanto o codigo escreve em `gold`). O
  catalogo precisa pre-existir; o schema o pipeline cria.
- O template original do bundle trazia `environment.dependencies: [--editable ...]` no pipeline;
  foi removido de proposito (nao ha pacote Python aqui) e re-adiciona-lo quebra o ambiente.
- Dinheiro e sempre `DECIMAL(10,2)`, com cast **antes** da multiplicacao -- em `double` a soma de
  milhares de linhas nao fecha com o total conferido pelo negocio.
- `@dp.expect` conta as linhas que **satisfazem** a condicao, entao as expectations afirmam o
  estado saudavel (`venda_depois_do_cadastro = NOT venda_antes_do_cadastro`) e a metrica de
  "falhas" e exatamente a contagem do problema. Falha esperada != regressao: confira o
  `BASELINE.md` antes de "consertar" uma expectation vermelha.
- Periodo dos dados: **13/12/2025 a 11/01/2026**. Nunca use `current_date()` em codigo, consulta
  de dashboard ou instrucao de Genie.
