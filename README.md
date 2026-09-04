# Ordem Paranormal RPG 2 — Playtest Research & Versioning Hub

Hub local-first para pesquisa, indexação, rastreabilidade e comparação de materiais de playtest, com foco em proveniência, versionamento e não-invenção.

## Princípios

- Original source wins.
- UNKNOWN is better than false.
- Nenhuma versão sobrescreve outra silenciosamente.
- Conteúdo oficial e interpretação ficam separados.

## Stack

- Next.js (App Router)
- TypeScript
- SQLite
- Drizzle ORM
- Zod
- Vitest

## Estrutura principal

- `sources/`: fontes originais e manifests
- `data/`: dados extraídos/canônicos/índices/anotações/homebrew
- `comparisons/`: snapshots e relatórios de comparação
- `research/`: pesquisa externa separada
- `assets/`: templates, prompts e referências visuais
- `src/`: schemas, validações e dados mock
- `app/`: Dashboard, Search, Entities, Entity Detail e Sources

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build

npm run source:add
npm run source:list
npm run source:verify
npm run index
npm run validate
npm run compare
```

## Segurança e privacidade

- Não commitar PDFs/ZIPs por padrão.
- Não colocar segredos no Git.
- Configure segredos localmente no `.env`.

## Status deste milestone

Implementa fundação (Phase 0 + início controlado da Phase 1): estrutura base, modelos/schemas, validação, mock experimental e páginas iniciais.
