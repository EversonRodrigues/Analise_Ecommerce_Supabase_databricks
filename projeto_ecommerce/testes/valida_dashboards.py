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


def main():
    arquivos = sorted(PASTA.glob("*.lvdash.json"))
    if not arquivos:
        print(f"Nenhum dashboard encontrado em {PASTA}")
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
    print(f"\n{len(arquivos)} dashboard(s) sem problema estrutural.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
