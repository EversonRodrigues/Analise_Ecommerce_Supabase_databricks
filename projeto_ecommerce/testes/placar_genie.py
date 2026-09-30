"""Placar do Genie space: pergunta pela API e confere contra SQL direto na gold.

POR QUE este script existe:
  Um space "deployado" nao prova nada. O que os diretores vao usar e a RESPOSTA, e a resposta
  depende de instrucao, join e SQL de exemplo -- coisas que nenhum validador estrutural consegue
  avaliar. Este script e o teste de aceitacao: 10 perguntas com numero conhecido e 2 perguntas de
  limite que o Genie deve RECUSAR sem inventar.

POR QUE cada pergunta abre uma conversa nova:
  Dentro de uma conversa o Genie se lembra do que veio antes, e a resposta de uma pergunta passa a
  depender da anterior. Isso esconde regressao: a pergunta 8 poderia "acertar" so porque a 7
  ensinou o recorte. Uma conversa por pergunta mede o space, nao o historico.

POR QUE o esperado tambem sai de SQL:
  Os numeros do enunciado estao no BASELINE.md, mas numero digitado a mao no teste envelhece.
  Cada pergunta aponta para um bloco de testes/sql/genie_gabarito.sql; o script roda o bloco e
  confere que o token esperado ainda aparece no resultado da gold. Se a bronze mudar, o script
  acusa "GABARITO DIVERGIU" em vez de culpar o Genie.

Uso:
  python testes/placar_genie.py                 # descobre o space pelo titulo
  python testes/placar_genie.py <space_id>      # forca um space
"""
import json
import pathlib
import re
import subprocess
import sys
import tempfile

RAIZ = pathlib.Path(__file__).resolve().parent.parent
GABARITO = RAIZ / "testes" / "sql" / "genie_gabarito.sql"
PERFIL = "AnaliseEcommerce"
WAREHOUSE = "47307f0445a667ac"
CATALOGO = "projetoecomerce"
TITULO_DO_SPACE = "Diretoria E-commerce"

# Cada pergunta: o texto exato, o bloco do gabarito que prova o numero, e os tokens que a resposta
# PRECISA conter. Acerto so quando todos os tokens aparecem -- "quase certo" nao conta.
PERGUNTAS = [
    {
        "pergunta": "Qual foi a receita total do período?",
        "bloco": "p01_receita_total",
        "tokens": ["974.077,28"],
    },
    {
        "pergunta": "Qual canal vende mais?",
        "bloco": "p02_canal_que_vende_mais",
        "tokens": ["2.155", "705.486,21", "327,37"],
    },
    {
        "pergunta": "Quais os 5 produtos que mais faturaram?",
        "bloco": "p03_top5_produtos",
        "tokens": [
            "Fone de Ouvido Esportivo",
            "Camisa Social",
            "Necessaire",
            "Persiana Vertical",
            "Jeans Skinny",
        ],
    },
    {
        "pergunta": "Qual categoria gerou mais receita?",
        "bloco": "p04_categoria_maior_receita",
        "tokens": ["Moda", "248.124,15"],
    },
    {
        "pergunta": "Quem são os 5 melhores clientes?",
        "bloco": "p05_top5_clientes",
        "tokens": ["Ana Sophia Pereira", "30.716,63"],
    },
    {
        "pergunta": "Quantos clientes VIP temos e quanto representam da receita?",
        "bloco": "p06_vip_participacao",
        "tokens": ["10", "262.806,22", "27,0"],
    },
    {
        "pergunta": "Qual região gera mais receita?",
        "bloco": "p07_regiao_maior_receita",
        "tokens": ["Norte", "333.078,69", "17"],
    },
    {
        "pergunta": "Qual dia da semana vende mais?",
        "bloco": "p08_dia_semana",
        "tokens": ["uarta", "34.753,61", "bado"],
    },
    {
        "pergunta": "Quantos produtos estão mais caros que todos os concorrentes?",
        "bloco": "p09_mais_caros_que_todos",
        "tokens": ["35", "20", "15", "nis"],
    },
    {
        "pergunta": "Dos 10 produtos que mais faturam, quais estão mais caros que a média do mercado?",
        "bloco": "p10_top10_mais_caros_que_a_media",
        "tokens": [
            "Camisa Social",
            "Persiana Vertical",
            "Shorts Jeans",
            "Vestido Floral",
            "Notebook Inspiron 15",
        ],
    },
    # Limite: a resposta certa e recusar. Nao ha gabarito em SQL -- o dado nao existe.
    {
        "pergunta": "Qual foi o nosso lucro?",
        "limite": "sem_lucro",
    },
    {
        "pergunta": "Quanto vendemos ontem?",
        "limite": "sem_ontem",
    },
]

NEGACOES = ("não há", "nao ha", "não existe", "nao existe", "não temos", "nao temos",
            "não está disponível", "nao esta disponivel", "não possuo", "nao possuo",
            "não é possível", "nao e possivel", "não disponho", "nao disponho")


def cli(args, entrada_json=None):
    if entrada_json is not None:
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
            json.dump(entrada_json, f, ensure_ascii=False)
            args = args + ["--json", "@" + f.name]
    r = subprocess.run(["databricks"] + args + ["-p", PERFIL], capture_output=True, text=True,
                       encoding="utf-8")
    if r.returncode != 0:
        return None, ((r.stdout or "") + (r.stderr or "")).strip()[:300]
    return json.loads(r.stdout) if r.stdout.strip() else {}, None


def descobre_space():
    d, erro = cli(["genie", "list-spaces", "-o", "json"])
    if erro:
        sys.exit(f"nao consegui listar os spaces: {erro}")
    for s in d.get("spaces", []):
        if TITULO_DO_SPACE in s.get("title", ""):
            return s["space_id"], s["title"]
    sys.exit(f"nenhum space com {TITULO_DO_SPACE!r} no titulo; faca o deploy antes")


def blocos_do_gabarito():
    partes = re.split(r"^-- @([a-z0-9_]+)\s*$", GABARITO.read_text(encoding="utf-8"), flags=re.M)
    saida = {}
    for i in range(1, len(partes), 2):
        sql = "\n".join(
            l for l in partes[i + 1].strip().splitlines() if not l.strip().startswith("--")
        )
        saida[partes[i]] = sql.strip().rstrip(";")
    return saida


def roda_sql(sql):
    payload = {"warehouse_id": WAREHOUSE, "catalog": CATALOGO, "schema": "gold",
               "wait_timeout": "50s", "statement": sql}
    d, erro = cli(["api", "post", "/api/2.0/sql/statements"], payload)
    if erro:
        return None, erro
    if d.get("status", {}).get("state") != "SUCCEEDED":
        return None, json.dumps(d.get("status", {}), ensure_ascii=False)[:200]
    linhas = d.get("result", {}).get("data_array") or []
    return " ".join(str(v) for linha in linhas for v in linha if v is not None), None


def pergunta_ao_genie(space_id, texto):
    """Uma conversa nova por pergunta. Devolve (resposta_em_texto, sql_gerado)."""
    d, erro = cli(["genie", "start-conversation", space_id, "-o", "json"], {"content": texto})
    if erro:
        return None, None, erro
    resposta, sql = [], []
    for anexo in d.get("attachments", []):
        if "text" in anexo:
            resposta.append(anexo["text"].get("content", ""))
        if "query" in anexo:
            sql.append(anexo["query"].get("query", ""))
            if anexo["query"].get("description"):
                resposta.append(anexo["query"]["description"])
    return "\n".join(resposta).strip(), "\n".join(sql).strip(), None


def canoniza(valor):
    """'974.077,28' e '974077.28' viram a mesma coisa: '974077.28'."""
    return f"{valor:.10f}".rstrip("0").rstrip(".")


def numeros_do_texto(texto, formato):
    """Conjunto de numeros de um texto, em forma canonica.

    POR QUE dois formatos: o Genie responde em portugues (R$ 974.077,28, 27,0%) e o warehouse
    devolve em ingles (974077.28, 27.0). Comparar as strings direto reprovaria toda pergunta certa
    -- foi exatamente o primeiro erro deste script.
    """
    encontrados = set()
    if formato == "ptbr":
        padrao = r"\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?"
        for achado in re.findall(padrao, texto):
            bruto = achado.replace(".", "").replace(",", ".")
            encontrados.add(canoniza(float(bruto)))
    else:
        for achado in re.findall(r"\d+(?:\.\d+)?", texto):
            encontrados.add(canoniza(float(achado)))
    return encontrados


def faltando_no_texto(tokens, texto, formato):
    """Token com digito e comparado como NUMERO; token de texto, como substring."""
    numeros = numeros_do_texto(texto, formato)
    faltando = []
    for token in tokens:
        if re.fullmatch(r"[\d.,]+", token):
            alvo = canoniza(float(token.replace(".", "").replace(",", ".")))
            achou = alvo in numeros
        else:
            achou = token.lower() in texto.lower()
        if not achou:
            faltando.append(token)
    return faltando


def avalia_limite(tipo, resposta, sql):
    baixo = resposta.lower()
    negou = any(n in baixo for n in NEGACOES)
    if tipo == "sem_lucro":
        citou = any(p in baixo for p in ("lucro", "margem", "custo"))
        if not negou or not citou:
            return False, "não disse claramente que lucro/custo/margem não existe nestes dados"
        return True, "recusou e explicou que não há custo/margem/lucro"
    # sem_ontem: nao pode gerar SQL, e tem de explicar o periodo
    if sql:
        return False, "gerou SQL para uma pergunta sobre 'ontem'"
    if "11/01/2026" not in resposta:
        return False, "não ofereceu 11/01/2026, o último dia com vendas"
    return True, "não gerou SQL, explicou o período e ofereceu 11/01/2026"


def main():
    space_id = sys.argv[1] if len(sys.argv) > 1 else None
    if space_id:
        titulo = "(informado na linha de comando)"
    else:
        space_id, titulo = descobre_space()
    print(f"Space: {titulo}\n       {space_id}\n")

    gabarito = blocos_do_gabarito()
    linhas, acertos, total_numericas = [], 0, 0

    for caso in PERGUNTAS:
        pergunta = caso["pergunta"]
        resposta, sql, erro = pergunta_ao_genie(space_id, pergunta)
        if erro:
            linhas.append((pergunta, f"ERRO: {erro}", "-", "NAO"))
            continue

        if "limite" in caso:
            ok, motivo = avalia_limite(caso["limite"], resposta, sql)
            linhas.append((pergunta, resposta, f"recusar sem inventar -- {motivo}",
                           "SIM" if ok else "NAO"))
            acertos += 1 if ok else 0
            continue

        total_numericas += 1
        esperado, erro_sql = roda_sql(gabarito[caso["bloco"]])
        if erro_sql:
            linhas.append((pergunta, resposta, f"ERRO NO GABARITO: {erro_sql}", "NAO"))
            continue
        # O gabarito tem de conter os tokens; se nao contiver, o problema e o dado, nao o Genie.
        faltando_no_gabarito = faltando_no_texto(caso["tokens"], esperado, "en")
        if faltando_no_gabarito:
            linhas.append((pergunta, resposta,
                           f"GABARITO DIVERGIU: {faltando_no_gabarito} nao estao na gold", "NAO"))
            continue
        faltando = faltando_no_texto(caso["tokens"], resposta, "ptbr")
        ok = not faltando
        acertos += 1 if ok else 0
        detalhe = " / ".join(caso["tokens"])
        if faltando:
            detalhe += f"  [faltou: {', '.join(faltando)}]"
        linhas.append((pergunta, resposta, detalhe, "SIM" if ok else "NAO"))

    print("| # | pergunta | resposta do Genie | esperado | acertou? |")
    print("|---|---|---|---|---|")
    for i, (pergunta, resposta, esperado, ok) in enumerate(linhas, start=1):
        limpa = " ".join((resposta or "").split())
        if len(limpa) > 220:
            limpa = limpa[:217] + "..."
        print(f"| {i} | {pergunta} | {limpa} | {esperado} | {ok} |")

    numericas_ok = sum(1 for l in linhas[:total_numericas] if l[3] == "SIM")
    limites_ok = sum(1 for l in linhas[total_numericas:] if l[3] == "SIM")
    print(f"\nPlacar: {numericas_ok}/{total_numericas} perguntas numericas, "
          f"{limites_ok}/{len(linhas) - total_numericas} perguntas de limite.")
    return 0 if acertos == len(linhas) else 1


if __name__ == "__main__":
    sys.exit(main())
