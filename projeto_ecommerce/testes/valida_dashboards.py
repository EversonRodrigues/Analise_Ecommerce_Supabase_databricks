"""Validador estrutural dos dashboards .lvdash.json.

POR QUE este script existe:
  `databricks bundle validate --strict` valida o YAML do bundle contra o schema do bundle.
  O .lvdash.json e apenas um arquivo referenciado, sem schema conhecido pela CLI. Ou seja:
  um JSON valido com `datasetName` errado, `fieldName` que nao existe na query do widget ou
  measure inexistente **deploya limpo e quebra so no navegador**. "Deploy passou" nao e
  evidencia de nada. Este script cobre exatamente essa lacuna, antes do deploy.

POR QUE checa encoding:
  Os dashboards tem "Loja física", "Não cadastrado" e "Período". O arquivo precisa ser UTF-8
  SEM BOM: o BOM quebra o parse do JSON em alguns leitores, e ANSI mangla os acentos -- e
  'Produto nao cadastrado' casa ZERO linhas contra o dado real 'Produto não cadastrado'.

Uso:
  python testes/valida_dashboards.py
"""
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PASTA = RAIZ / "src" / "dashboards"
LARGURA_GRID = 12

# ---------------------------------------------------------------- Vitrine Design System
# Tokens da skill "Vitrine Design System" (tokens/colors.css). O tema fica no
# uiSettings.theme de cada dashboard; aqui so se cobra que ele exista e use estes valores --
# cor inventada em um dashboard so quebra a unidade da suite sem ninguem perceber.
TEMA_ESPERADO = {
    "canvasBackgroundColor": {"light": "#FAFAF7", "dark": "#0A1224"},
    "widgetBackgroundColor": {"light": "#FFFFFF", "dark": "#0F1B33"},
    "widgetBorderColor": {"light": "#FFFFFF", "dark": "#0F1B33"},
    "fontColor": {"light": "#0F1B33", "dark": "#F4F6FA"},
    "selectionColor": {"light": "#7FA30F", "dark": "#C6F432"},
    "visualizationColors": ["#0F1B33", "#3B6FE0", "#1F9D6B", "#A8D61A", "#F2A516", "#8390AA"],
    "fontFamily": "Figtree",
    "widgetCornerRadius": 20,
    "widgetHeaderAlignment": "LEFT",
}

# Cores que podem aparecer pinadas em color.scale.mappings: a paleta acima + os semanticos do DS
# (--danger-500 para "mais caro que todos", --warning-500 para "a confirmar", --success-500).
CORES_PERMITIDAS = set(TEMA_ESPERADO["visualizationColors"]) | {
    "#E0473C",  # danger-500
    "#F2A516",  # warning-500
    "#1F9D6B",  # success-500
    "#C6F432",  # lime-500
    "#7FA30F",  # lime-700
}

# Texto que o diretor le tem de estar em portugues de verdade. O repo escreve CODIGO sem acento
# (o shell mangla acento), e essa convencao ja vazou uma vez para titulo de widget e bloco de
# insight. O DS e explicito: portugues do Brasil, sentence case, sem caps de enfase.
PALAVRAS_SEM_ACENTO = (
    r"nao|periodo|medio|media|medias|preco|precos|acao|acoes|regiao|regioes|numero|unico|"
    r"catalogo|proposito|sabado|util|varios|concentracao|dependencia|grafico|fisica|tambem|"
    r"so|ultima|cotacao|cotacoes|classificacao|maximo|minimo|atencao|confianca|populacoes|"
    r"precificacao|reducao|ingestao|promocao|relampago|sistemico|pratica|distribuicao|"
    r"frequencia|aquisicao|conversao|estrategia|publico|ativacao|participacao|revisao|ruido|"
    r"tres|ja|sao|entao|grao"
)
CAPS_DE_ENFASE = r"NAO|TODOS|MAIOR|MEDIA|NUNCA|ATENCAO|ZERO|MESMO|METADE|DISTINTOS"
COPY_RUIM = re.compile(rf"\b({PALAVRAS_SEM_ACENTO}|{CAPS_DE_ENFASE})\b")

# Chaves cujo valor e CODIGO (SQL, nome de campo), nao texto para humano: ficam fora da checagem
# de copy.
CHAVES_DE_CODIGO = {
    "queryLines", "expression", "name", "fieldName", "datasetName", "queryName",
    "orderedValues", "value", "dataValue",
}

# Padroes proibidos: cada um ja foi uma decisao consciente do projeto.
PROIBIDOS = [
    (r"current_date", "current_date() -- o periodo e fixo (13/12/2025 a 11/01/2026)"),
    (r"clientes_unicos", "clientes_unicos nao pode ser somado entre linhas; use COUNT(DISTINCT id_cliente)"),
    (r"AVG\(`?ticket_medio`?\)", "media de ticket_medio e media de medias; use SUM(receita)/SUM(vendas)"),
    (r"FROM\s+\w+\.\w+", "nome qualificado com catalogo/schema; a query deve dizer so FROM <tabela>"),
    (r"vendas_temporais", "nenhum dashboard deste projeto le vendas_temporais (esparsa + clientes_unicos)"),
]


def erros_do_arquivo(caminho):
    erros = []
    bruto = caminho.read_bytes()

    if bruto.startswith(b"\xef\xbb\xbf"):
        erros.append("arquivo comeca com BOM; precisa ser UTF-8 sem BOM")
        return erros
    try:
        texto = bruto.decode("utf-8")
    except UnicodeDecodeError as exc:
        erros.append(f"nao e UTF-8 valido: {exc}")
        return erros
    try:
        dash = json.loads(texto)
    except json.JSONDecodeError as exc:
        erros.append(f"JSON invalido: {exc}")
        return erros

    for padrao, motivo in PROIBIDOS:
        for achado in re.finditer(padrao, texto, re.IGNORECASE):
            erros.append(f"padrao proibido {achado.group(0)!r}: {motivo}")

    # Datasets: nome unico, e o conjunto de measures (columns[].displayName) de cada um.
    measures_por_dataset = {}
    for ds in dash.get("datasets", []):
        nome = ds.get("name")
        if not nome:
            erros.append("dataset sem `name`")
            continue
        if nome in measures_por_dataset:
            erros.append(f"dataset {nome!r} declarado duas vezes")
        measures_por_dataset[nome] = {
            col.get("displayName") for col in ds.get("columns", [])
        }
        if not ds.get("queryLines"):
            erros.append(f"dataset {nome!r} sem queryLines")

    nomes_widgets = set()
    for pagina in dash.get("pages", []):
        ocupado = {}
        for entrada in pagina.get("layout", []):
            widget = entrada.get("widget", {})
            nome = widget.get("name", "<sem nome>")
            if nome in nomes_widgets:
                erros.append(f"widget {nome!r} tem nome repetido")
            nomes_widgets.add(nome)

            # Posicao: dentro do grid de 12 colunas e sem sobreposicao.
            pos = entrada.get("position", {})
            x, y = pos.get("x", 0), pos.get("y", 0)
            larg, alt = pos.get("width", 0), pos.get("height", 0)
            if larg <= 0 or alt <= 0:
                erros.append(f"{nome}: largura/altura invalida ({larg}x{alt})")
            if x + larg > LARGURA_GRID:
                erros.append(f"{nome}: x+width = {x + larg} passa das {LARGURA_GRID} colunas")
            for linha in range(y, y + alt):
                for coluna in range(x, x + larg):
                    anterior = ocupado.get((linha, coluna))
                    if anterior:
                        erros.append(f"{nome}: sobrepoe {anterior} na celula ({coluna},{linha})")
                    ocupado[(linha, coluna)] = nome

            # Textbox: o Databricks concatena `lines` SEM separador, igual a queryLines.
            # Verificado comparando o JSON enviado com o que o servidor devolveu: sem o
            # "\n" explicito os paragrafos vem grudados e as strings vazias sao
            # descartadas. Entao cada elemento precisa terminar em "\n" (e o separador
            # de paragrafo e um elemento "\n", nunca "").
            if "multilineTextboxSpec" in widget:
                linhas_texto = widget["multilineTextboxSpec"].get("lines", [])
                if len(linhas_texto) > 1:
                    for texto in linhas_texto:
                        if texto == "":
                            erros.append(f"{nome}: `lines` tem string vazia; use \"\\n\"")
                        elif not texto.endswith("\n"):
                            erros.append(
                                f"{nome}: elemento de `lines` sem \\n no fim "
                                f"({texto[:40]!r}...); os paragrafos vao grudar"
                            )
                continue

            queries = widget.get("queries", [])
            if not queries:
                erros.append(f"{nome}: widget sem `queries` e sem multilineTextboxSpec")
                continue

            campos_por_query = {}
            for query in queries:
                nome_query = query.get("name")
                corpo = query.get("query", {})
                ds_nome = corpo.get("datasetName")
                if ds_nome not in measures_por_dataset:
                    erros.append(f"{nome}: datasetName {ds_nome!r} nao existe nos datasets")
                campos = {}
                for campo in corpo.get("fields", []):
                    campos[campo.get("name")] = campo.get("expression", "")
                campos_por_query[nome_query] = campos

                # Referencia a measure precisa casar com uma column do dataset.
                for expressao in campos.values():
                    achado = re.fullmatch(r"MEASURE\(`(.+)`\)", expressao or "")
                    if achado and ds_nome in measures_por_dataset:
                        if achado.group(1) not in measures_por_dataset[ds_nome]:
                            erros.append(
                                f"{nome}: MEASURE({achado.group(1)!r}) nao existe em {ds_nome!r}"
                            )

            # Todo fieldName citado no spec precisa existir nos fields da query do widget.
            todos_os_campos = set()
            for campos in campos_por_query.values():
                todos_os_campos.update(campos)

            spec = widget.get("spec", {})
            encodings = spec.get("encodings", {})
            alvos = []
            for chave, valor in encodings.items():
                if chave in ("columns", "fields") and isinstance(valor, list):
                    alvos.extend(valor)
                elif isinstance(valor, dict):
                    alvos.append(valor)
            for alvo in alvos:
                campo = alvo.get("fieldName")
                if campo and campo not in todos_os_campos:
                    erros.append(f"{nome}: fieldName {campo!r} nao esta nos fields da query")
                query_citada = alvo.get("queryName")
                if query_citada and query_citada not in campos_por_query:
                    erros.append(f"{nome}: queryName {query_citada!r} nao existe no widget")
            if not spec.get("widgetType"):
                erros.append(f"{nome}: spec sem widgetType")

    return erros


def erros_do_link_do_genie(arquivos):
    """Os 3 dashboards tem de apontar para o MESMO Genie space, por uiSettings.genieSpace.

    POR QUE uiSettings.genieSpace e nao um widget:
      Genie NAO e widget (nao existe `widgetType: assistant`), e tambem nao e campo de bundle
      (`resources.Dashboard` nao tem nada de Genie). O botao "Ask Genie" nasce de
      `uiSettings.genieSpace: {isEnabled, overrideId, enablementMode}` dentro do .lvdash.json --
      e o que a skill databricks-aibi-dashboards documenta. A primeira versao deste projeto usava
      um widget de texto com link markdown: funcionava, mas nao era o botao nativo.

    POR QUE checar os tres juntos:
      O arquivo nao recebe variavel do bundle, entao o space_id esta FIXO nos tres. Atualizar um e
      esquecer os outros deixa dois dashboards apontando para um space que nao existe mais, sem
      ninguem reclamar. Lembrete: o id e o do space de DEV; em prod o space e outro recurso, com
      outro id -- ao promover, troque nos tres de uma vez.
    """
    erros = []
    ids = {}
    for caminho in arquivos:
        dash = json.loads(caminho.read_text(encoding="utf-8"))
        genie = dash.get("uiSettings", {}).get("genieSpace")
        if not genie:
            erros.append(f"{caminho.name}: sem uiSettings.genieSpace (o botao Ask Genie)")
            continue
        if genie.get("isEnabled") is not True or genie.get("enablementMode") != "ENABLED":
            erros.append(f"{caminho.name}: genieSpace presente mas desligado")
        alvo = genie.get("overrideId", "")
        if not re.fullmatch(r"[0-9a-f]{32}", alvo or ""):
            erros.append(f"{caminho.name}: overrideId {alvo!r} nao tem cara de space_id (32 hex)")
        ids[caminho.name] = alvo
        if "/genie/rooms/" in caminho.read_text(encoding="utf-8"):
            erros.append(
                f"{caminho.name}: sobrou link markdown para /genie/rooms/; "
                "o lugar do Genie e uiSettings.genieSpace"
            )
    if len(set(ids.values())) > 1:
        erros.append(f"os dashboards citam space_ids diferentes: {sorted(set(ids.values()))}")
    return erros


def colunas_do_select(ds):
    """Nomes e aliases do SELECT do dataset, na marra (sem parser de SQL).

    Serve para uma checagem so: nome de measure nao pode colidir com nome de coluna. Se a heuristica
    errar, ela erra reconhecendo MENOS colunas -- ou seja, pode deixar passar, nunca acusar falso.
    """
    sql = "".join(ds.get("queryLines", []))
    nomes = set()
    for linha in sql.splitlines():
        limpa = linha.strip().rstrip(",")
        if not limpa or limpa.upper().startswith(
            ("SELECT", "FROM", "WHERE", "ORDER", "GROUP", "QUALIFY", "--")
        ):
            continue
        if " AS " in limpa.upper():
            nomes.add(limpa.rsplit(" ", 1)[-1].strip(","))
        elif limpa.replace("_", "").isalnum():
            nomes.add(limpa)
    return {n.lower() for n in nomes}


def erros_de_colisao_de_measure(nome, dash):
    """Measure NAO pode ter o nome de uma coluna do dataset.

    POR QUE: para o motor do AI/BI os identificadores sao case-insensitive, entao uma measure
    `Receita` sobre a coluna `receita` vira `SUM(Receita)` -- referencia a si mesma. O widget quebra
    em tempo de execucao com "BAD_REQUEST: Circular reference detected in calculated field: receita",
    e quebra tambem quem usa measure cuja expressao passa por essa coluna. Nem o `bundle validate`
    nem o deploy reclamam: o erro aparece so no navegador, o que foi exatamente o que aconteceu.
    Corrija renomeando a MEASURE (ex.: "Receita total"); a coluna e referenciada por tabela e filtro.
    """
    erros = []
    for ds in dash.get("datasets", []):
        colunas = colunas_do_select(ds)
        for col in ds.get("columns", []):
            rotulo = col.get("displayName", "")
            if rotulo.lower() in colunas:
                erros.append(
                    f"{nome}: measure {rotulo!r} em {ds['name']} tem o nome de uma coluna do "
                    "SELECT -- referencia circular em tempo de execucao; renomeie a measure"
                )
    return erros


def erros_do_tema(nome, dash):
    """O tema do Vitrine DS e obrigatorio e igual nos tres dashboards.

    POR QUE: sem `uiSettings.theme` o dashboard herda o default do workspace e sai generico -- e
    a suite deixa de parecer a mesma empresa. E cor fora dos tokens do DS passa despercebida.
    """
    erros = []
    tema = dash.get("uiSettings", {}).get("theme")
    if not tema:
        return [f"{nome}: sem uiSettings.theme (o tema do Vitrine Design System)"]
    for chave, esperado in TEMA_ESPERADO.items():
        if tema.get(chave) != esperado:
            erros.append(f"{nome}: theme.{chave} = {tema.get(chave)!r}, esperado {esperado!r}")
    return erros


def erros_de_cor_pinada(nome, dash):
    """Cor pinada em color.scale.mappings tem de sair dos tokens do DS."""
    erros = []

    def anda(o):
        if isinstance(o, dict):
            for chave, valor in o.items():
                if chave == "mappings" and isinstance(valor, list):
                    for m in valor:
                        cor = m.get("color")
                        if isinstance(cor, str) and cor.upper() not in CORES_PERMITIDAS:
                            erros.append(
                                f"{nome}: cor {cor!r} em mappings nao e token do Vitrine DS"
                            )
                        if isinstance(cor, dict):
                            erros.append(
                                f"{nome}: mappings[].color como objeto {cor!r}; o grafico so "
                                "honra hex puro"
                            )
                else:
                    anda(valor)
        elif isinstance(o, list):
            for v in o:
                anda(v)

    anda(dash)
    return erros


def erros_de_copy(nome, dash):
    """Texto que o diretor le: portugues com acento, sem caps de enfase.

    Percorre so o que e legenda/titulo/descricao/markdown -- SQL e nome de campo ficam de fora
    (esses seguem a convencao do repo, que e sem acento de proposito).
    """
    erros = []

    def anda(o, caminho=""):
        if isinstance(o, dict):
            for chave, valor in o.items():
                if chave in CHAVES_DE_CODIGO:
                    continue
                anda(valor, f"{caminho}/{chave}")
        elif isinstance(o, list):
            for v in o:
                anda(v, caminho)
        elif isinstance(o, str):
            achado = COPY_RUIM.search(o)
            if achado:
                erros.append(
                    f"{nome}: {achado.group(0)!r} em {caminho} -- copy e interface, "
                    f"vai acentuada e em sentence case ({o[:60]!r}...)"
                )

    anda(dash)
    return erros


def main():
    arquivos = sorted(PASTA.glob("*.lvdash.json"))
    if not arquivos:
        print(f"Nenhum dashboard encontrado em {PASTA}")
        return 1

    total = 0
    erros_globais = erros_do_link_do_genie(arquivos)
    if erros_globais:
        total += len(erros_globais)
        print("FALHOU  link do Genie (entre dashboards)")
        for erro in erros_globais:
            print(f"        - {erro}")

    for caminho in arquivos:
        erros = erros_do_arquivo(caminho)
        try:
            dash = json.loads(caminho.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            dash = None
        if dash is not None:
            erros += erros_de_colisao_de_measure(caminho.name, dash)
            erros += erros_do_tema(caminho.name, dash)
            erros += erros_de_cor_pinada(caminho.name, dash)
            erros += erros_de_copy(caminho.name, dash)
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
    print(f"\n{len(arquivos)} dashboard(s) sem problema estrutural.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
