# ADR-0019: Capability Engine Oficial

## Status

Aceita.

## Contexto

O Nyx OS passa a ter Runtime, Event Bus, Plugin Framework, Scheduler e Memory Engine. O proximo ponto de extensao necessario e um contrato para expor funcionalidades executaveis de forma descoberta, controlada e desacoplada.

Sem um mecanismo oficial, o AI Runtime futuro, plugins e servicos poderiam chamar implementacoes diretamente, recriando acoplamento e dificultando observabilidade, testes e troca de implementacoes.

## Decisao

- Criar `@nyx-os/capabilities` como pacote oficial de capacidades.
- Definir `NyxCapability` como contrato publico.
- Criar `CapabilityRegistry` para registro, remocao, busca e listagem.
- Criar `CapabilityExecutor` para execucao padronizada.
- Criar `CapabilityManager` como fachada publica.
- Integrar capacidades ao Runtime por `runtime.getCapabilities()`.
- Disponibilizar capacidades para plugins por `context.capabilities`.
- Emitir eventos oficiais:
  - `capability.registered`;
  - `capability.removed`;
  - `capability.executed`;
  - `capability.failed`.
- Criar apenas `DiagnosticsCapability` e `MemoryCapability` como validacao arquitetural inicial.

## Alternativas Consideradas

- Deixar cada plugin expor funcoes diretamente.
- Aguardar o AI Runtime para criar o contrato.
- Implementar capacidades como servicos do Runtime.
- Criar uma camada de tool calling acoplada a IA.

## Consequencias

- O Runtime passa a expor capacidades por contrato, sem depender de IA.
- Plugins podem registrar capacidades sem conhecer consumidores futuros.
- O AI Runtime futuro devera descobrir e executar funcionalidades exclusivamente por esse mecanismo.
- Observabilidade passa pelo Event Bus oficial.
- LLM, planejamento, automacoes, tool calling e decisoes inteligentes permanecem fora do escopo atual.
