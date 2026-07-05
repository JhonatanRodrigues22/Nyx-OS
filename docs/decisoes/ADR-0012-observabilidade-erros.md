# ADR-0012: Observabilidade e tratamento de erros

## Status

Aceita.

## Contexto

O Nyx OS lida com dados pessoais e ações futuras assistidas por IA. Logs e erros precisam ajudar manutenção sem expor dados sensíveis.

## Decisão

- Logs devem evitar dados pessoais desnecessários.
- Eventos importantes e ações assistidas por IA devem ser rastreáveis.
- Python futuro usará `structlog` sobre `logging`.
- APIs futuras devem padronizar códigos e mensagens de erro.
- Ações destrutivas ou sensíveis podem exigir confirmação no futuro.

## Alternativas consideradas

- Logs livres por módulo.
- Auditoria completa já no MVP.

## Consequências

- O MVP não carrega auditoria complexa prematura.
- A arquitetura preserva caminho para rastreabilidade.
- Segurança e privacidade continuam parte da fundação.
