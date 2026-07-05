# Packages

Pacotes compartilhados do monorepo Nyx OS.

Estes diretórios documentam a arquitetura alvo. Eles não implementam funcionalidades nesta sprint.

## Pacotes planejados

- `core/`: entidades, casos de uso e regras centrais.
- `memory/`: memória persistente e contexto reutilizável.
- `ai/`: contratos de interação com IA.
- `event-bus/`: barramento oficial e tipado de eventos técnicos.
- `events/`: stream em memória de eventos recentes para snapshots e dashboard.
- `automation/`: automações auditáveis.
- `plugin/`: contrato oficial e manager de plugins.
- `scheduler/`: contrato oficial e manager de tarefas recorrentes.
- `plugins/`: espaço reservado para integrações extensíveis futuras.
- `shared/`: utilitários compartilhados de baixo acoplamento.
- `config/`: configuração tipada e carregamento de ambientes.
- `logging/`: logging e observabilidade.
- `database/`: contratos e acesso a persistência.

## Regra

Packages devem ter dependências explícitas e evitar ciclos.
