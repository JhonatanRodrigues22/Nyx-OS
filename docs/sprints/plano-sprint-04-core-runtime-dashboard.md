# Sprint 04 — Core Runtime e Dashboard Base

## Objetivo

Construir a primeira base executavel do Nyx OS, com runtime, configuracao central, event bus em memoria, servicos iniciais e dashboard visual.

## Entregas

- Runtime base com status, ambiente, versao e modulos.
- Configuracao central consumida pelo runtime.
- Event Bus em memoria.
- Services para runtime, eventos, status e dashboard.
- Dashboard com sidebar, topbar, cards, modulos, eventos recentes e health check visual.
- Navegacao visual para areas futuras.
- Design system inicial com tokens, cards, badges e indicadores.
- Testes para runtime, config, event bus, services e renderizacao do dashboard.

## Fora de escopo

- Login real.
- Banco conectado.
- Memoria persistente.
- IA real.
- Automacoes reais.
- Integracoes externas.
- Notificacoes reais.
- Captura de dados do computador.

## Regra arquitetural

Componentes React devem renderizar dados. Dados mockados e regras de composicao ficam em services/packages.

## Validacao esperada

- `npm install`
- `npm run lint`
- `npm test -- --runInBand`
- `npm run build`
- `npm audit`

Se scripts auxiliares forem afetados:

- `python scripts/package.py`
