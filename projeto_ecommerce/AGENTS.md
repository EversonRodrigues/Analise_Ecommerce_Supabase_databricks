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

### Fluxo de trabalho

- Sempre rode `databricks bundle validate --strict -p AnaliseEcommerce` antes do deploy.
- Deploy em dev: `databricks bundle deploy -t dev -p AnaliseEcommerce`.
- Valide o grafo antes do run real: `databricks bundle run projeto_ecommerce_etl --validate-only
  -t dev -p AnaliseEcommerce`. Isso checa SQL, tipos e ciclos sem materializar tabela nenhuma.
- Execucao: `databricks bundle run pipeline_ecommerce -t dev -p AnaliseEcommerce`.
- O `display()` do notebook de testes NAO aparece no output do job. Para ver o quadro dos testes,
  extraia a lista `TESTES` de `testes/testes_qualidade.py` e rode as consultas no warehouse.

### Numeros de referencia

Baseline conferido em 25/09/2026 sobre o periodo 13/12/2025 a 11/01/2026. Se um destes numeros
mudar sem que a bronze tenha mudado, houve regressao -- investigue antes de seguir.

**Volumes da silver**

| tabela | linhas |
|---|---|
| `silver.vendas` | 3.020 |
| `silver.produtos` | 215 |
| `silver.clientes` | 50 |
| `silver.preco_competidores` | 728 |

**Dinheiro**

- Receita total: **R$ 974.077,28** (bate em `silver.vendas`, `gold.vendas_temporais`,
  `gold.vendas_produtos` e `gold.vendas_detalhadas`).
- Canal: ecommerce 2.155 vendas · loja_fisica 865.
- `gold.precos_competitividade` soma **R$ 969.837,27** de proposito: faltam os R$ 4.240,01 dos
  produtos nao cadastrados, que nao tem preco de concorrente. Nao e erro.

**Problemas de qualidade marcados (nunca descartados)**

- 20 vendas de produto nao cadastrado -- R$ 4.240,01 (0,662% das vendas).
- 5 vendas antes da data de criacao do produto -- R$ 325,88.
- 55 cotacoes de concorrente suspeitas, concentradas em 15 produtos.
- 11 clientes com pronome de tratamento no nome original.
- 4 nomes com particula (`da`) corrigida pelo tratamento de caixa.

**Distribuicoes**

- Clientes por regiao: Norte 17 · Nordeste 12 · Centro-Oeste 9 · Sudeste 8 · Sul 4.
- Segmentos: 10 VIP · 25 TOP_TIER · 15 REGULAR. Maior cliente: Ana Sophia Pereira (MG,
  R$ 30.716,63).
- Faixa de preco dos produtos: BASICO 200 · PREMIUM 8 · MEDIO 7.
- Competitividade: MAIS_CARO_QUE_TODOS 35 · ACIMA_DA_MEDIA 92 · ABAIXO_DA_MEDIA 76 ·
  NA_MEDIA 6 · MAIS_BARATO_QUE_TODOS 6. Os 15 produtos com preco suspeito estao TODOS em
  MAIS_CARO_QUE_TODOS -- ou seja, dos 35, 20 sao alta de preco real e 15 dependem de confirmar a
  cotacao do concorrente.

**Linhas das gold**

| tabela | linhas |
|---|---|
| `gold.clientes_segmentacao` | 50 |
| `gold.vendas_temporais` | 908 |
| `gold.vendas_produtos` | 205 |
| `gold.vendas_detalhadas` | 3.020 |
| `gold.precos_competitividade` | 215 |

**Testes e expectations**

- `testes/testes_qualidade.py`: **18 testes**, todos passando.
- Expectations com falha esperada (warn, medem problema conhecido): `preco_plausivel` 55,
  `produto_cadastrado` 20, `venda_depois_do_cadastro` 5. Todas as expectations de **fail** em 0.
- 70 colunas comentadas nas 5 gold (12 + 15 + 22 + 12 + 9), nenhuma sem comentario.
