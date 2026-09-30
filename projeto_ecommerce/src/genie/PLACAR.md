# Placar do Genie space "Diretoria E-commerce"

Registro das rodadas de teste do space: o que o placar deu, o que mudou entre uma rodada e a
seguinte, e por que. Reproduzir com:

```bash
python testes/placar_genie.py          # abre uma conversa nova por pergunta
```

Acerto = a resposta traz **todos** os numeros esperados. As duas perguntas de limite ("Qual foi o
nosso lucro?" e "Quanto vendemos ontem?") passam quando o Genie **recusa sem inventar**.
O esperado nunca foi ajustado para caber na resposta: quando errou, mudou o **contexto do space**.

## Rodada 1 -- 8/10 aparentes, mas o placar estava errado

Placar bruto: 2/10. Nao era o space: era o **script**. O gabarito devolve `974077.28` (formato do
warehouse) e o Genie responde `R$ 974.077,28` (formato pt-BR); comparar as duas strings reprovava
toda pergunta certa. Corrigido em `testes/placar_genie.py` com `numeros_do_texto()`, que canoniza os
dois formatos antes de comparar. Licao: a primeira coisa a desconfiar num teste novo e o teste.

## Rodada 2 -- 8/10 + 2/2

Erros reais, os dois de natureza diferente:

- **Pergunta 9** ("quantos produtos mais caros que todos") -- o Genie acertou tudo (35, 20, 15,
  Tenis). Quem errou foi o **gabarito**: o bloco `p09` nao trazia a coluna do total, so as duas
  linhas por situacao, entao o token `35` nao existia no resultado da gold. Corrigido no SQL do
  gabarito com `SUM(COUNT(*)) OVER ()`.
- **Pergunta 7** ("qual regiao gera mais receita") -- receita e ticket certos, **sem o numero de
  clientes**. A instrucao dizia que o numero de clientes "so entra em pergunta por regiao, estado ou
  segmento": isso e *permissao*, nao *obrigacao*, e o Genie leu como permissao.

## Rodada 3 -- 9/10 + 2/2

O 9 virou acerto. O 7 continuou faltando os 17 clientes, mesmo com a instrucao reescrita como
obrigacao ("traga TAMBEM o numero de clientes"). Confirma o que o enunciado avisa: **regra que falha
em texto passa com um SQL de exemplo no formato certo**.

Mudanca da rodada 4, em duas frentes:

- A obrigacao ganhou **linha propria** nas instrucoes, em vez de virar oracao subordinada de outra
  regra: "Toda pergunta por REGIAO, ESTADO ou SEGMENTO e obrigada a trazer tambem o numero de
  clientes ... Sem isso a resposta esta incompleta."
- O SQL de exemplo de regiao (`Qual a receita por regiao e categoria?`) passou a **mostrar** o
  formato, com `COUNT(DISTINCT id_cliente) AS clientes` e um comentario dizendo por que. Nao foi
  criado exemplo novo: criar um sobre "qual regiao vende mais" seria entregar a resposta da pergunta
  7 do teste.

Essas duas mudancas custaram caracteres, e as instrucoes passaram do teto de 2.500 (2.564). Tres
frases foram enxugadas sem perder regra -- o teto obriga a escolher, que e o objetivo dele.

## Rodada 4 -- 10/10 + 2/2

Fechou. **Rodada 5** repetiu 10/10 + 2/2 sem nenhuma mudanca no space, o que descarta sorte de uma
execucao so.

| # | pergunta | resposta do Genie (resumida) | esperado | acertou? |
|---|---|---|---|---|
| 1 | Qual foi a receita total do período? | A receita total no período de 13/12/2025 a 11/01/2026 foi de **R$ 974.077,28**, faturamento bruto. | 974.077,28 | SIM |
| 2 | Qual canal vende mais? | **E-commerce**: 2.155 vendas, R$ 705.486,21, ticket médio R$ 327,37. | 2.155 / 705.486,21 / 327,37 | SIM |
| 3 | Quais os 5 produtos que mais faturaram? | Fone de Ouvido Esportivo, Camisa Social, Necessaire, Persiana Vertical, Calça Jeans Skinny. | os 5 nomes | SIM |
| 4 | Qual categoria gerou mais receita? | **Moda**, com R$ 248.124,15. | Moda / 248.124,15 | SIM |
| 5 | Quem são os 5 melhores clientes? | Ana Sophia Pereira em primeiro, R$ 30.716,63 (MG, VIP). | Ana Sophia Pereira / 30.716,63 | SIM |
| 6 | Quantos clientes VIP temos e quanto representam da receita? | 10 clientes VIP, R$ 262.806,22, 27,0% da receita. | 10 / 262.806,22 / 27,0 | SIM |
| 7 | Qual região gera mais receita? | **Norte**, R$ 333.078,69, **17 clientes**. | Norte / 333.078,69 / 17 | SIM |
| 8 | Qual dia da semana vende mais? | **Quarta-feira** pela média por dia (R$ 34.753,61); sábado lidera no total por ter 5 no período. | Quarta / 34.753,61 / sábado | SIM |
| 9 | Quantos produtos estão mais caros que todos os concorrentes? | 35 no total: 20 confirmados e 15 com preço a confirmar, todos de Tênis. | 35 / 20 / 15 / Tênis | SIM |
| 10 | Dos 10 produtos que mais faturam, quais estão mais caros que a média do mercado? | 5: Camisa Social, Persiana Vertical, Shorts Jeans, Vestido Floral, Notebook Inspiron 15. | os 5 nomes | SIM |
| 11 | Qual foi o nosso lucro? | "Não há dados de custo, margem, lucro, desconto ou imposto neste banco; só existe receita bruta." | recusar sem inventar | SIM |
| 12 | Quanto vendemos ontem? | "Não é possível responder perguntas sobre 'ontem' ... O último dia com vendas é 11/01/2026; deseja ver esse dia?" (sem gerar SQL) | recusar sem inventar | SIM |

**Placar final: 10/10 perguntas numericas + 2/2 perguntas de limite.**

## O que estas rodadas ensinam

1. **Desconfie do teste antes do modelo.** O placar 2/10 da rodada 1 era bug de formatacao de
   numero; o space ja estava certo em 8 das 10.
2. **Permissao nao e obrigacao.** "So entra em pergunta por regiao" o Genie leu como "pode entrar".
   A regra virou acerto quando ficou imperativa E ganhou linha propria.
3. **Exemplo vence texto.** A mesma regra em prosa falhou duas rodadas; entrou no SQL de exemplo e
   passou. Mas o exemplo tem de ser de OUTRA pergunta -- exemplo com a pergunta do teste e cola.
4. **Teto de caracteres e ferramenta, nao obstaculo.** Estourar o teto forcou a cortar frase que
   repetia o que o `COMMENT` da coluna ja diz.
