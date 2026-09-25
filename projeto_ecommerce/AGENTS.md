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

### Fluxo de trabalho

- Sempre rode `databricks bundle validate --strict -p AnaliseEcommerce` antes do deploy.
- Deploy em dev: `databricks bundle deploy -t dev -p AnaliseEcommerce`.
- Execucao: `databricks bundle run pipeline_ecommerce -t dev -p AnaliseEcommerce`.
