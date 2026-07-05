# ADR-0013: Runtime Genérico e Serviços Desacoplados

## Status

Aceita.

## Contexto

O Nyx OS precisa de um núcleo capaz de inicializar, coordenar e encerrar capacidades internas sem assumir a existência de produtos futuros, integrações externas ou clientes específicos.

Uma referência arquitetural externa apresentou ideias úteis para runtime, service manager, dependências explícitas, event bus, scheduler e plugin loader. O projeto oficial, porém, é um monorepo TypeScript com Next.js e packages internos. A referência deve orientar decisões, não substituir a arquitetura existente.

## Decisão

- O Runtime do Nyx OS deve ser genérico.
- O Runtime conhece apenas serviços registrados, seus estados, suas dependências e o Event Bus.
- Serviços devem declarar dependências explicitamente.
- Serviços sobem respeitando dependências e descem na ordem inversa de inicialização.
- Comunicação entre serviços deve priorizar eventos antes de acoplamento direto.
- A Nyx Assistente é um cliente previsto do Nyx OS, mas não faz parte do Runtime.
- Projetos futuros, integrações e automações devem entrar por serviços ou plugins desacoplados quando existirem.
- Scheduler e plugin loader não entram no núcleo agora porque o app atual roda sobre Next.js e ainda não possui processo longo dedicado nem contrato de plugin estável.

## Alternativas Consideradas

- Copiar a referência Python para dentro do projeto oficial.
- Manter o runtime apenas como snapshot de dashboard.
- Criar dependências explícitas para clientes futuros ainda não implementados.
- Implementar scheduler e plugin loader imediatamente.

## Consequências

- O núcleo fica pequeno e reutilizável.
- O Dashboard passa a ser um cliente do estado do runtime, não o próprio runtime.
- Novos serviços podem ser adicionados sem alterar a UI.
- Dependências circulares e ausentes passam a falhar cedo.
- Integrações futuras continuam possíveis sem contaminar o núcleo com promessas técnicas prematuras.
