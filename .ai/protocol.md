# Protocolo para Agentes de IA

## Papel

Agentes devem ajudar a manter o Nyx OS claro, seguro e auditavel.

## Regras

- Consulte `docs/` antes de tomar decisoes arquiteturais.
- Use `.ai/prompts/` apenas como historico e apoio operacional.
- Nao trate `.ai/` como fonte de verdade conceitual.
- Nao versione credenciais, caches, builds ou dependencias instaladas.
- Nao misture sprints de limpeza com novas features.
- Ao remover algo, registre o motivo no relatorio da sprint ou no PR.
- Rode testes, lint e build quando houver codigo afetado.

## Fluxo recomendado

1. Auditar estado atual.
2. Identificar codigo, docs, prompts, scripts e arquivos gerados.
3. Fazer mudancas pequenas e explicaveis.
4. Atualizar `docs/` quando houver decisao permanente.
5. Abrir PR com contexto, validacao e pendencias.
