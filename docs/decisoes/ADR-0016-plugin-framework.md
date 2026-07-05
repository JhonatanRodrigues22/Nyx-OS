# ADR-0016: Plugin Framework Como Mecanismo de Expansão

## Status

Aceita.

## Contexto

O Nyx OS deve evoluir por capacidades modulares sem transformar o Runtime em um núcleo rígido e cheio de dependências específicas.

Após Runtime, State Service e Event Bus, o projeto já possui base suficiente para registrar, inicializar e observar módulos desacoplados. A próxima decisão estrutural é definir como funcionalidades futuras entram no sistema.

## Decisão

- Criar `@nyx-os/plugin` como pacote oficial de plugins.
- Definir o contrato `NyxPlugin`.
- Criar `PluginManager` para registrar, listar, inicializar, descartar, remover e consultar plugins.
- Integrar o Plugin Manager ao `NyxRuntime`.
- Expor `registerPlugin`, `unregisterPlugin`, `getPlugin` e `getPlugins`.
- Emitir eventos oficiais pelo Event Bus:
  - `plugin.registered`;
  - `plugin.initialized`;
  - `plugin.disposed`;
  - `plugin.unregistered`;
  - `plugin.failed`.
- Criar `RuntimeDiagnosticsPlugin` apenas como plugin interno de validação arquitetural.

## Alternativas Consideradas

- Adicionar módulos futuros diretamente ao Runtime.
- Usar apenas serviços para toda extensão.
- Adiar o framework até existir um plugin real.
- Criar um loader automático já nesta Sprint.

## Consequências

- O Runtime passa a ser uma plataforma extensível.
- Capacidades futuras podem evoluir com menor acoplamento.
- O Event Bus se torna o canal oficial de lifecycle dos plugins.
- O dashboard passa a mostrar a infraestrutura de plugins.
- Descoberta automática, sandbox, marketplace, permissões, Scheduler, Memory, IA, Skills e Automation continuam fora do escopo atual.
