# BASELINE.md -- numeros de referencia

Este arquivo guarda o **estado esperado dos dados**, nao regras de projeto (essas ficam no
AGENTS.md). E o unico arquivo de instrucoes que muda quando a bronze muda.

Como usar: rode o job, compare com os numeros abaixo. Divergencia **sem** mudanca na bronze e
regressao -- investigue antes de seguir. Se a bronze mudou de verdade, atualize este arquivo no
mesmo commit que reconhece a mudanca, com a nova data de conferencia.

**Conferido em 25/09/2026**, sobre o periodo 13/12/2025 a 11/01/2026.

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
