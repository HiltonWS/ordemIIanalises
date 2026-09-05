# Arquivo do Playtest — OP2

Aplicação privada para indexar, pesquisar e comparar versões do playtest de Ordem Paranormal RPG 2. O projeto atual contém a baseline **Alpha v1.0** e não republica os PDFs ou anexos de origem.

O espelho público no GitHub contém o código, testes, ferramentas e um conjunto demonstrativo sem o texto integral do playtest. A base completa permanece restrita ao ambiente privado.

Os arquivos sanitizados usados nesse espelho ficam em `examples/public-data/`. Ao preparar uma publicação pública, eles substituem os dados privados da aplicação e removem a identidade do Site; não faça essa troca no Site privado.

## O que está indexado

- 103 páginas com texto pesquisável, seção, ato, tags e hash de conteúdo.
- 72 extras com nome original, categoria, personagem, formato, dimensões/duração, tamanho e SHA-256.
- 19 mecânicas conectadas, 16 pontos de interesse oficiais, 4 notas de revisão editorial e 9 fontes.
- 10 pontos de interesse originais e 3 conceitos originais de ficha com artes identificadas como IA.

## Desenvolvimento

Requer Node.js 22.13+.

```bash
npm ci
npm run dev
```

Validação:

```bash
npm run lint
npm test
```

## Importar uma nova versão

O importador nunca altera a versão anterior. Prepare uma pasta extraída e o texto do novo PDF:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r tools/requirements.txt
pdftotext -layout NOVA_VERSAO.pdf nova-versao.txt
python tools/build_index.py \
  --pdf NOVA_VERSAO.pdf \
  --text nova-versao.txt \
  --extras EXTRAS_EXTRAIDOS \
  --curated app/data/curated.json \
  --output versions/beta-v1/index.json \
  --version "Beta v1.0" \
  --version-id "beta-v1.0" \
  --date "2026-11"
```

Compare a nova versão com a baseline:

```bash
python tools/compare_versions.py \
  app/data/archive-index.json \
  versions/beta-v1/index.json \
  --output versions/alpha-v1.0--beta-v1.0.json
```

Estados possíveis: `adicionado`, `removido`, `alterado`, `movido`, `renomeado` e `inalterado`. Correspondências automáticas usam `canonicalId`, assinatura de título/ato, hash e, por último, similaridade conservadora. Sugestões de renomeação devem ser revisadas por uma pessoa.

## Raspberry Pi / Docker

Em um Raspberry Pi 4 ou 5 com Docker e Compose:

```bash
docker compose up -d --build
```

A interface fica disponível na porta `3000`. Para uso fora da rede local, coloque um proxy com TLS e autenticação na frente do serviço; o conteúdo indexado é privado.

## Proveniência e licença

O sistema separa `oficial`, `extra oficial`, `relação curada`, `inferência`, `homebrew original` e `fonte externa`. O visual não reproduz a identidade gráfica oficial. Materiais gerados por IA aparecem rotulados. Antes de qualquer publicação aberta, faça uma nova revisão conforme a [Licença Comunitária](https://ordemparanormal.com.br/licenca).

Nunca envie ao repositório público PDFs/ZIPs de origem, extrações integrais, índices privados, credenciais ou um `project_id` de Sites pertencente a outro ambiente. Consulte `AGENTS.md` antes de importar uma nova versão.
