# Diretrizes de Desenvolvimento

## Objetivos

- Centralizar a gestão de dados pessoais e operacionais.
- Minimizar atrito cognitivo.
- Permitir uso pelo PC e celular.
- Criar uma base confiável para a Nyx Assistente e a Nyx Local.
- Preservar clareza, segurança, auditabilidade e evolução modular.

## Regras de produto

1. Desenvolver primeiro o que gera valor imediato.
2. Evitar complexidade antes de validar o fluxo principal.
3. Separar claramente MVP, versão futura e sonho de longo prazo.
4. Toda feature deve responder qual problema real resolve.
5. O dashboard deve servir ação e contexto, não apenas exibir informação.
6. A experiência deve respeitar a rotina real do usuário, inclusive dias caóticos.

## Regras técnicas

1. Usar serviços gratuitos sempre que possível.
2. Não versionar credenciais, arquivos pessoais, caches ou builds.
3. Desenvolver por experiência do usuário: capturar, encontrar, conectar e agir.
4. Preferir protótipos pequenos antes de adicionar complexidade.
5. Registrar decisões permanentes em `docs/decisoes/`.
6. Manter prompts e contexto de agentes em `.ai/` ou `docs/prompts/`, sem substituir `docs/`.
7. Usar TypeScript para código da aplicação.
8. Rodar testes, lint e build antes de PRs relevantes.
9. Evitar acoplamento forte entre módulos.
10. Criar APIs simples e previsíveis para uso futuro por agentes.

## Fluxo de trabalho

- Cada sprint deve ter objetivo claro.
- Mudanças devem entrar por branch e Pull Request.
- PRs devem explicar contexto, alterações, validação e pendências.
- Sprints de limpeza não devem adicionar features.
- Sprints de produto devem atualizar documentação quando mudarem visão, escopo ou arquitetura.

## Integração com a Nyx Assistente

A Nyx Assistente deve interagir com APIs simples e bem documentadas.

Automações futuras precisam ser auditáveis, reversíveis quando possível e registradas em decisões de arquitetura.

A IA pode sugerir, organizar e executar ações, mas o sistema precisa manter clareza sobre o que foi feito, quando foi feito e com base em quais dados.
