"""Validador estrutural do Genie space .geniespace.json.

POR QUE este script existe:
  Mesma lacuna dos dashboards. `databricks bundle validate --strict` valida o YAML do bundle; o
  .geniespace.json e apenas um arquivo referenciado, inlinado em `serialized_space` no deploy.
  O servidor do Genie recusa campo desconhecido (bom), mas nao tem opiniao sobre REGRA DE NEGOCIO:
  uma instrucao que manda usar current_date(), uma tabela da silver na lista de fontes ou uma
  pergunta inicial que volta vazia deployam limpo e quebram na cara do diretor.

POR QUE checa o \\n no fim de cada elemento:
  As listas de texto do serialized_space (content, sql, question) sao concatenadas SEM separador,
  igual a `queryLines` dos dashboards -- conferido comparando o JSON enviado com o que
  `genie get-space --include-serialized-space` devolve. Sem o \\n as linhas vem grudadas.

POR QUE checa encoding:
  As instrucoes e as perguntas iniciais tem acento ("Loja fisica" e exibida como "Loja física").
  O arquivo precisa ser UTF-8 SEM BOM: o BOM quebra o parse do JSON em alguns leitores e ANSI
  mangla o acento.

O schema aceito pelo servidor (descoberto mandando campo por campo e lendo a recusa):
  version, config.sample_questions[{id, question[]}], data_sources.tables[{identifier,
  description[]?}], instructions.text_instructions[{id, content[]}],
  instructions.example_question_sqls[{id, question[], sql[]}],
  instructions.sql_snippets.{measures,expressions}[{id, display_name (string!), sql[]}].
  NAO existe campo para join nem para sinonimo de coluna: os dois vao no texto das instrucoes.

Uso:
  python testes/valida_genie.py
"""
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PASTA = RAIZ / "src" / "genie"

CATALOGO = "projetoecomerce"
TABELAS_ESPERADAS = {
    f"{CATALOGO}.gold.{t}"
    for t in (
        "vendas_temporais",
        "vendas_produtos",
        "vendas_detalhadas",
        "clientes_segmentacao",
        "precos_competitividade",
    )
}

# O enunciado pede instrucoes gerais curtas. O teto existe para forcar a escolha: o que cabe num
# COMMENT da gold NAO deve ser repetido aqui.
TETO_INSTRUCOES = 2500

# Padroes proibidos: cada um ja foi uma decisao consciente do projeto.
#
# ATENCAO -- estes padroes sao procurados SO NO SQL (exemplos e snippets), nunca no texto das
# instrucoes. No texto eles aparecem de proposito, como PROIBICAO ("Nunca current_date() nem
# now()", "nunca some clientes_unicos"): varrer o arquivo inteiro reprovaria justamente a
# instrucao que existe para evitar o erro. No SQL nao ha essa ambiguidade -- ali seria executado.
PROIBIDOS = [
    (r"current_date", "current_date() -- o periodo e fixo (13/12/2025 a 11/01/2026)"),
    (r"\bnow\(\)", "now() -- o periodo e fixo, nao existe 'agora' nestes dados"),
    (r"\bclientes_unicos\b", "clientes_unicos nao pode ser somado; use COUNT(DISTINCT id_cliente)"),
    (r"AVG\(\s*`?ticket_medio`?\s*\)", "media de ticket_medio e media de medias"),
    (r"\.(bronze|silver)\.", "o space le apenas a gold"),
]

# As 12 perguntas do teste de aceitacao (10 numericas + 2 de limite). Nenhuma pode aparecer como
# pergunta inicial nem como SQL de exemplo: o space estaria entregando a resposta do proprio teste.
PERGUNTAS_DO_TESTE = [
    "receita total do periodo",
    "canal vende mais",
    "produtos que mais faturaram",
    "categoria gerou mais receita",
    "melhores clientes",
    "clientes vip temos",
    "regiao gera mais receita",
    "dia da semana vende mais",
    "produtos estao mais caros que todos",
    "dos 10 produtos que mais faturam",
    "nosso lucro",
    "vendemos ontem",
]


def normaliza(texto):
    """Minuscula, sem acento e sem pontuacao, para comparar pergunta com pergunta."""
    texto = texto.lower()
    for de, para in (("á", "a"), ("â", "a"), ("ã", "a"), ("à", "a"), ("é", "e"), ("ê", "e"),
                     ("í", "i"), ("ó", "o"), ("ô", "o"), ("õ", "o"), ("ú", "u"), ("ç", "c")):
        texto = texto.replace(de, para)
    return re.sub(r"[^a-z0-9 ]", " ", texto)


def checa_lista_de_texto(erros, rotulo, valor):
    """Toda lista de texto do serialized_space e concatenada sem separador."""
    if not isinstance(valor, list) or not valor:
        erros.append(f"{rotulo}: precisa ser uma lista de strings nao vazia")
        return
    if len(valor) == 1:
        return
    for i, linha in enumerate(valor[:-1]):
        if linha == "":
            erros.append(f"{rotulo}[{i}]: string vazia; use \"\\n\"")
        elif not linha.endswith("\n"):
            erros.append(
                f"{rotulo}[{i}]: sem \\n no fim ({linha[:40]!r}...); as linhas vao grudar"
            )


def checa_id(erros, rotulo, valor, vistos):
    if not isinstance(valor, str) or not re.fullmatch(r"[0-9a-f]{32}", valor):
        erros.append(f"{rotulo}: id {valor!r} nao e hex de 32 caracteres")
        return
    if valor in vistos:
        erros.append(f"{rotulo}: id {valor} repetido")
    vistos.add(valor)


def checa_ordem_por_id(erros, rotulo, itens):
    """O servidor EXIGE cada lista ordenada por id ("must be sorted by id", 400 no deploy).

    POR QUE os ids deste projeto comecam com um ordinal de 2 digitos (01..12):
      com id aleatorio, a ordem exigida pelo servidor brigaria com a ordem de leitura do arquivo.
      Com o ordinal na frente, ordem de id == ordem em que se le -- e a lista ja nasce ordenada.
    """
    ids = [i.get("id") for i in itens if isinstance(i.get("id"), str)]
    if ids != sorted(ids):
        erros.append(f"{rotulo} fora de ordem; o servidor exige ordem por id")


def erros_do_arquivo(caminho):
    erros = []
    bruto = caminho.read_bytes()

    if bruto.startswith(b"\xef\xbb\xbf"):
        return ["arquivo comeca com BOM; precisa ser UTF-8 sem BOM"]
    try:
        texto = bruto.decode("utf-8")
    except UnicodeDecodeError as exc:
        return [f"nao e UTF-8 valido: {exc}"]
    try:
        space = json.loads(texto)
    except json.JSONDecodeError as exc:
        return [f"JSON invalido: {exc}"]

    if space.get("version") != 2:
        erros.append(f"version {space.get('version')!r}: o servidor espera 2")

    # Fontes: exatamente as 5 golds, qualificadas com o catalogo (o arquivo nao recebe variavel
    # do bundle, entao o nome tem de estar completo).
    tabelas = [t.get("identifier") for t in space.get("data_sources", {}).get("tables", [])]
    for identificador in tabelas:
        if identificador not in TABELAS_ESPERADAS:
            erros.append(f"tabela {identificador!r} nao e uma das 5 golds esperadas")
    for esperada in sorted(TABELAS_ESPERADAS - set(tabelas)):
        erros.append(f"falta a tabela {esperada}")
    if len(tabelas) != len(set(tabelas)):
        erros.append("ha tabela repetida em data_sources.tables")
    # O servidor EXIGE a lista ordenada por identifier ("Invalid export proto: data_sources.tables
    # must be sorted by identifier", 400 no deploy). Checar aqui troca um deploy quebrado por uma
    # linha de erro local.
    if tabelas != sorted(tabelas):
        erros.append("data_sources.tables fora de ordem; o servidor exige ordem por identifier")

    ids = set()
    instrucoes = space.get("instructions", {})

    # Instrucoes gerais: curtas, e o teto e sobre a soma (o servidor aceita varias).
    total_texto = 0
    if not instrucoes.get("text_instructions"):
        erros.append("sem instructions.text_instructions")
    checa_ordem_por_id(erros, "instructions.text_instructions", instrucoes.get("text_instructions", []))
    checa_ordem_por_id(
        erros, "instructions.example_question_sqls", instrucoes.get("example_question_sqls", [])
    )
    checa_ordem_por_id(
        erros, "config.sample_questions", space.get("config", {}).get("sample_questions", [])
    )
    for grupo in ("measures", "expressions"):
        checa_ordem_por_id(
            erros,
            f"instructions.sql_snippets.{grupo}",
            instrucoes.get("sql_snippets", {}).get(grupo, []),
        )
    for i, bloco in enumerate(instrucoes.get("text_instructions", [])):
        checa_id(erros, f"text_instructions[{i}]", bloco.get("id"), ids)
        conteudo = bloco.get("content")
        checa_lista_de_texto(erros, f"text_instructions[{i}].content", conteudo)
        if isinstance(conteudo, list):
            total_texto += sum(len(x) for x in conteudo)
    if total_texto > TETO_INSTRUCOES:
        erros.append(
            f"instrucoes gerais com {total_texto} caracteres; o teto do projeto e {TETO_INSTRUCOES}"
        )

    # SQL de exemplo: cada um com pergunta e SQL, e nenhum repetindo pergunta do teste.
    perguntas_normalizadas = []
    sqls = []
    for i, exemplo in enumerate(instrucoes.get("example_question_sqls", [])):
        checa_id(erros, f"example_question_sqls[{i}]", exemplo.get("id"), ids)
        checa_lista_de_texto(erros, f"example_question_sqls[{i}].question", exemplo.get("question"))
        checa_lista_de_texto(erros, f"example_question_sqls[{i}].sql", exemplo.get("sql"))
        if isinstance(exemplo.get("sql"), list):
            sqls.append((f"example_question_sqls[{i}]", "".join(exemplo["sql"])))
        if isinstance(exemplo.get("question"), list):
            perguntas_normalizadas.append(
                (f"example_question_sqls[{i}]", normaliza("".join(exemplo["question"])))
            )

    # Snippets: display_name e STRING (o servidor recusa lista), o sql e lista.
    snippets = instrucoes.get("sql_snippets", {})
    for grupo in ("measures", "expressions"):
        for i, snip in enumerate(snippets.get(grupo, [])):
            rotulo = f"sql_snippets.{grupo}[{i}]"
            checa_id(erros, rotulo, snip.get("id"), ids)
            if not isinstance(snip.get("display_name"), str) or not snip["display_name"]:
                erros.append(f"{rotulo}.display_name: precisa ser uma string nao vazia")
            checa_lista_de_texto(erros, f"{rotulo}.sql", snip.get("sql"))
            if isinstance(snip.get("sql"), list):
                sqls.append((rotulo, "".join(snip["sql"])))

    # Perguntas iniciais: exatamente 6 (duas por diretoria) e nenhuma do teste.
    iniciais = space.get("config", {}).get("sample_questions", [])
    if len(iniciais) != 6:
        erros.append(f"{len(iniciais)} perguntas iniciais; o enunciado pede 6 (duas por diretoria)")
    for i, pergunta in enumerate(iniciais):
        checa_id(erros, f"sample_questions[{i}]", pergunta.get("id"), ids)
        checa_lista_de_texto(erros, f"sample_questions[{i}].question", pergunta.get("question"))
        if isinstance(pergunta.get("question"), list):
            perguntas_normalizadas.append(
                (f"sample_questions[{i}]", normaliza("".join(pergunta["question"])))
            )

    # Padroes proibidos: so no SQL, pelo motivo explicado na definicao de PROIBIDOS -- e so no SQL
    # que EXECUTA. Os comentarios `--` do exemplo explicam ao Genie o erro que ele deve evitar
    # ("AVG(ticket_medio) seria media de medias"), e citar o padrao ali e o objetivo, nao o defeito.
    for rotulo, sql in sqls:
        executavel = re.sub(r"--[^\n]*", "", sql)
        for padrao, motivo in PROIBIDOS:
            for achado in re.finditer(padrao, executavel, re.IGNORECASE):
                erros.append(f"{rotulo}: padrao proibido {achado.group(0)!r}: {motivo}")

    for rotulo, pergunta in perguntas_normalizadas:
        for do_teste in PERGUNTAS_DO_TESTE:
            if normaliza(do_teste) in pergunta:
                erros.append(
                    f"{rotulo}: repete a pergunta do teste ({do_teste!r}); o teste viraria cola"
                )

    return erros


def main():
    arquivos = sorted(PASTA.glob("*.geniespace.json"))
    if not arquivos:
        print(f"Nenhum Genie space encontrado em {PASTA}")
        return 1

    total = 0
    for caminho in arquivos:
        erros = erros_do_arquivo(caminho)
        total += len(erros)
        if erros:
            print(f"FALHOU  {caminho.name}")
            for erro in erros:
                print(f"        - {erro}")
        else:
            print(f"OK      {caminho.name}")

    if total:
        print(f"\n{total} problema(s) encontrado(s).")
        return 1
    print(f"\n{len(arquivos)} Genie space(s) sem problema estrutural.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
