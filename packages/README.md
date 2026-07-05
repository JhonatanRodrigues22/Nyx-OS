# Packages

Pacotes compartilhados do monorepo Nyx OS.

Estes diretórios documentam a arquitetura alvo. Eles não implementam funcionalidades nesta sprint.

## Pacotes planejados

- `core/`: entidades, casos de uso e regras centrais.
- `memory/`: memória persistente e contexto reutilizável.
- `ai/`: contratos de interação com IA.
- `events/`: eventos de domínio e barramento interno.
- `automation/`: automações auditáveis.
- `plugins/`: integrações extensíveis.
- `shared/`: utilitários compartilhados de baixo acoplamento.
- `config/`: configuração tipada e carregamento de ambientes.
- `logging/`: logging e observabilidade.
- `database/`: contratos e acesso a persistência.

## Regra

Packages devem ter dependências explícitas e evitar ciclos.
