# silver.clientes -- cadastro de clientes limpo, chave id_cliente.
#
# POR QUE materialized view com leitura batch:
#   Mesma razao de silver.produtos: a bronze e sobrescrita a cada execucao, entao nao existe
#   fonte append-only para uma streaming table ler.
#
# POR QUE guardar nome_original:
#   A limpeza do nome (remover pronome de tratamento, aplicar formato titulo) e uma
#   interpretacao nossa. Se amanha alguem contestar um nome, precisamos poder provar o que
#   veio da origem. Sobrescrever o nome sem guardar o original destroi essa rastreabilidade.
#
# POR QUE remover o pronome de tratamento:
#   "Sr. Joao Vitor Barros" e "Joao Vitor Barros" sao a MESMA pessoa. Mantendo o pronome,
#   qualquer agrupamento ou deduplicacao por nome trata os dois como clientes diferentes.
#   A regex e ancorada no inicio (^) de proposito: "Dra." no meio do nome e parte do nome.
#
# POR QUE as particulas voltam para minuscula depois do initcap:
#   O initcap poe maiuscula em toda palavra, entao 'Murilo da Mata' virava 'Murilo Da Mata'.
#   Em portugues a particula e minuscula, e este nome vai direto para o dashboard da diretoria e
#   para as respostas do Genie -- nome errado na tela e erro visivel para o negocio. A troca so
#   vale para a palavra inteira no MEIO do nome: a primeira palavra fica como esta (nenhum nome
#   comeca por particula) e 'Eduardo' nao pode ser afetado pela particula 'e'.
#
# POR QUE a tabela de UFs mora aqui dentro:
#   Nao existe tabela de estados na bronze. As 27 UFs do IBGE sao uma constante do pais --
#   nao mudam com os dados e nao valem uma tabela de dimensao. Declaradas no arquivo, ficam
#   versionadas junto com a regra que as usa.
#
# POR QUE regiao preenchida e um FAIL e nao um warn:
#   regiao nula so acontece se a UF nao for uma das 27 do IBGE. Isso nao e "cliente com dado
#   ruim", e endereco impossivel no Brasil -- provavelmente erro de ingestao. Qualquer analise
#   por regiao ficaria silenciosamente incompleta. Melhor parar do que publicar errado.

from pyspark import pipelines as dp
from pyspark.sql import Window
from pyspark.sql import functions as F

# As 27 unidades federativas do IBGE: sigla -> (nome do estado, regiao).
UFS_IBGE = {
    # Norte
    "AC": ("Acre", "Norte"),
    "AP": ("Amapá", "Norte"),
    "AM": ("Amazonas", "Norte"),
    "PA": ("Pará", "Norte"),
    "RO": ("Rondônia", "Norte"),
    "RR": ("Roraima", "Norte"),
    "TO": ("Tocantins", "Norte"),
    # Nordeste
    "AL": ("Alagoas", "Nordeste"),
    "BA": ("Bahia", "Nordeste"),
    "CE": ("Ceará", "Nordeste"),
    "MA": ("Maranhão", "Nordeste"),
    "PB": ("Paraíba", "Nordeste"),
    "PE": ("Pernambuco", "Nordeste"),
    "PI": ("Piauí", "Nordeste"),
    "RN": ("Rio Grande do Norte", "Nordeste"),
    "SE": ("Sergipe", "Nordeste"),
    # Centro-Oeste
    "DF": ("Distrito Federal", "Centro-Oeste"),
    "GO": ("Goiás", "Centro-Oeste"),
    "MT": ("Mato Grosso", "Centro-Oeste"),
    "MS": ("Mato Grosso do Sul", "Centro-Oeste"),
    # Sudeste
    "ES": ("Espírito Santo", "Sudeste"),
    "MG": ("Minas Gerais", "Sudeste"),
    "RJ": ("Rio de Janeiro", "Sudeste"),
    "SP": ("São Paulo", "Sudeste"),
    # Sul
    "PR": ("Paraná", "Sul"),
    "RS": ("Rio Grande do Sul", "Sul"),
    "SC": ("Santa Catarina", "Sul"),
}

# Pronomes de tratamento removidos do INICIO do nome. O ponto e escapado e o \s* final
# engole o espaco que sobra depois da remocao.
REGEX_PRONOME = r"^(Sr|Sra|Srta|Dr|Dra)\.\s*"

# Particulas que ficam em minuscula no meio do nome, pela convencao do portugues.
PARTICULAS = ("da", "das", "de", "do", "dos", "e")


def _particulas_em_minuscula(coluna):
    """Devolve as particulas do nome a minuscula depois do initcap.

    O initcap nao sabe distinguir particula de sobrenome, entao 'Murilo da Mata' virava
    'Murilo Da Mata'. E uma substituicao por particula porque o regexp_replace do Spark nao
    minusculiza o grupo capturado -- nao existe o \\L do sed no replacement do Java.
    """
    for particula in PARTICULAS:
        # Os lookarounds (?<=\s) e (?=\s) garantem que so a palavra INTEIRA e NO MEIO do nome
        # e trocada. Isso protege dois casos: a primeira palavra nunca e particula (um nome nao
        # comeca com 'Da'), e 'Eduardo' nao pode perder a maiuscula por causa do 'e'.
        coluna = F.regexp_replace(
            coluna, rf"(?<=\s){particula.capitalize()}(?=\s)", particula
        )
    return coluna


def _mapa(indice):
    """Constroi um map SQL sigla -> valor a partir de UFS_IBGE (0 = nome, 1 = regiao)."""
    pares = []
    for uf, valores in UFS_IBGE.items():
        pares.append(F.lit(uf))
        pares.append(F.lit(valores[indice]))
    return F.create_map(*pares)


@dp.materialized_view(
    name="silver.clientes",
    comment="Clientes deduplicados, com nome sem pronome de tratamento e regiao do IBGE.",
)
@dp.expect_all_or_fail(
    {
        "id_cliente_preenchido": "id_cliente IS NOT NULL AND trim(id_cliente) <> ''",
        "regiao_preenchida": "regiao IS NOT NULL",
    }
)
def silver_clientes():
    bronze = spark.read.table("bronze.clientes")

    janela = Window.partitionBy("id_cliente").orderBy(
        F.col("data_cadastro").desc_nulls_last(), F.col("nome_cliente").asc_nulls_last()
    )

    estado_padronizado = F.upper(F.trim(F.col("estado")))

    return (
        bronze.withColumn("_ordem", F.row_number().over(janela))
        .filter(F.col("_ordem") == 1)
        .drop("_ordem")
        .withColumn("estado", estado_padronizado)
        .select(
            F.col("id_cliente"),
            # nome_original preserva exatamente o que veio da bronze.
            F.col("nome_cliente").alias("nome_original"),
            # initcap normaliza o caixa depois de tirar o pronome: "JOAO silva" -> "Joao Silva".
            # Em seguida as particulas voltam para minuscula: "Murilo Da Mata" -> "Murilo da Mata".
            _particulas_em_minuscula(
                F.initcap(
                    F.trim(F.regexp_replace(F.col("nome_cliente"), REGEX_PRONOME, ""))
                )
            ).alias("nome_cliente"),
            F.col("estado"),
            _mapa(0)[F.col("estado")].alias("nome_estado"),
            _mapa(1)[F.col("estado")].alias("regiao"),
            F.col("pais"),
            F.col("data_cadastro"),
        )
    )
