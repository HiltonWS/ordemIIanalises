# AGENTS.md

## Missão do repositório

Manter uma interface pesquisável e versionada para análises do playtest de Ordem Paranormal RPG 2, separando com clareza material oficial, inferência editorial, fontes externas e conteúdo original.

Estas instruções valem para todo o repositório. Um `AGENTS.md` mais específico em uma subpasta pode acrescentar regras locais, mas não pode relaxar as regras de privacidade, direitos autorais ou proveniência abaixo.

## Limites obrigatórios

- Nunca commitar PDFs, ZIPs, áudios, mapas, tokens, fichas oficiais, senhas, credenciais, cookies ou URLs assinadas.
- Nunca commitar texto integral extraído do playtest nem um índice que permita reconstruir o livro ou seus extras.
- O repositório público deve usar somente dados demonstrativos, metadados mínimos, análise transformativa e conteúdo original.
- Não copiar `.openai/hosting.json` entre ambientes. Um `project_id` existente pertence ao Site que o criou.
- Não imitar logotipos, diagramação, tipografia proprietária ou identidade visual oficial.
- Toda arte criada por modelo generativo deve ser original, visualmente distinta e marcada como `IA` na interface e nos metadados.
- Baixar somente arquivos oferecidos como gratuitos pelo titular ou por distribuidor autorizado. Materiais pagos ou que exijam conta ficam apenas catalogados por URL e estado de acesso.

## Fontes de verdade

- `app/data/archive-index.json`: índice usado pela interface. No GitHub público, deve conter apenas a amostra sanitizada.
- `app/data/curated.json`: relações e conteúdo curado usado para gerar uma base privada.
- `docs/source-register.md`: registro humano das fontes, licenças, disponibilidade e downloads legais.
- `tools/build_index.py`: gera um índice determinístico a partir de fontes privadas locais.
- `tools/compare_versions.py`: compara duas versões sem alterar a baseline.
- `tests/`: contratos de integridade, renderização e componentes.

## Taxonomia e proveniência

Use exatamente um rótulo primário por registro:

- `oficial`: página do documento-base;
- `extra oficial`: anexo distribuído com o playtest;
- `relação curada`: ligação editorial verificável entre registros;
- `inferência`: hipótese ou achado que exige revisão humana;
- `homebrew original`: criação nova para teste de mesa;
- `fonte externa`: referência bibliográfica ou inspiração fora do playtest.

Tags devem ser curtas, em português, minúsculas e reutilizadas quando o conceito já existir. Não use tags para esconder incerteza: registre-a em `provenance`, `evidence` ou na nota editorial.

## Fluxo para uma nova versão

1. Preserve a versão anterior sem edição.
2. Trabalhe com as fontes na pasta privada ignorada pelo Git.
3. Gere texto e metadados com `tools/build_index.py`, usando um novo `version-id` estável.
4. Compare com `tools/compare_versions.py`.
5. Revise manualmente itens `renomeado`, `movido` e correspondências por similaridade.
6. Atualize relações, achados e registro de fontes.
7. Confirme que o conjunto destinado ao GitHub não contém texto integral ou arquivos oficiais.
8. Rode build, lint e testes antes de abrir PR.

Estados aceitos no diff: `adicionado`, `removido`, `alterado`, `movido`, `renomeado` e `inalterado`.

## Regras de interface

- A busca deve continuar insensível a acentos e atravessar registros, tags, fontes e relações.
- Filtros precisam funcionar por tipo e escopo sem esconder a proveniência.
- Comparações devem mostrar o que mudou e como a correspondência foi decidida.
- Fichas e pontos originais devem continuar separados dos exemplos oficiais.
- Preserve acessibilidade, navegação por teclado, layout responsivo e texto principal com pelo menos 16 px.
- Não adicione reprodução ou download de fontes privadas à interface pública.

## Verificação

Use Node.js 22.13 ou superior.

```bash
npm ci
npm run lint
npm test
```

Para alterações no indexador ou comparador, execute também um diff da baseline contra ela mesma; o resultado esperado é somente `inalterado`.

## Pontos editoriais em aberto

- Conferir a possível divergência de `Compartilhar` entre as páginas 22 e 23.
- Conferir a possível descrição duplicada de `Depósito A` na página 91.
- Normalizar a exibição de `Handout 9` para `Handout 09` sem renomear o arquivo oficial.

Esses itens são pistas de revisão, não correções confirmadas. Não altere conteúdo oficial sem evidência e revisão humana.
