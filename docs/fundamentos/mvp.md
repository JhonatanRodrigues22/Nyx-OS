# MVP do Nyx OS

## Objetivo do MVP

Criar a primeira versão funcional do Nyx OS como central pessoal simples, utilizável e preparada para integração com a Nyx.

O MVP não precisa realizar toda a visão de longo prazo. Ele precisa provar que o Nyx OS já consegue organizar contexto e gerar valor diário.

## Recorte do MVP

O MVP deve focar em cinco capacidades:

1. **Captura rápida**
   - Registrar tarefas, notas, decisões e informações importantes com pouco atrito.

2. **Painel do dia**
   - Mostrar o que importa agora: tarefas, projetos, hábitos, check-in e pendências relevantes.

3. **Projetos**
   - Permitir acompanhar projetos ativos, próximos passos, status e registros importantes.

4. **Diário / check-in**
   - Registrar estado do dia, resumo, observações e contexto pessoal.

5. **APIs para a Nyx**
   - Expor dados de forma simples para que a Nyx Assistente consiga consultar e futuramente operar o sistema.

## Funcionalidades prioritárias

### Prioridade alta

- Estrutura base da aplicação.
- Autenticação e banco.
- Tipos centrais do domínio.
- CRUD básico de tarefas e projetos.
- Registro simples de notas, decisões e memórias.
- Dashboard inicial.
- Documentação clara da arquitetura e do produto.

### Prioridade média

- Check-in diário.
- Hábitos.
- Finanças simples.
- Tags.
- Busca inicial.
- PWA instalável.

### Prioridade baixa no MVP

- Avatar.
- Voz.
- Automações complexas.
- Integração profunda com Home Assistant.
- IA local autônoma.
- Multiusuário avançado.
- Analytics sofisticado.

## Fora de escopo do MVP

- Rodar em micro PC como servidor dedicado.
- Substituir completamente Obsidian, Notion ou calendário.
- Ter agente autônomo executando ações complexas.
- Criar interface perfeita de primeiro momento.
- Implementar todos os módulos futuros.
- Construir sistema de permissões complexo.

## Critério de sucesso

O MVP é bem-sucedido quando:

- o usuário consegue abrir o Nyx OS e entender o dia;
- tarefas e projetos podem ser registrados e consultados;
- decisões e memórias importantes não se perdem;
- a documentação permite que outro agente continue o projeto;
- a arquitetura não bloqueia a visão de longo prazo;
- a Nyx consegue usar o Nyx OS como base de contexto.

## Regra de corte

Quando houver dúvida se algo entra no MVP, perguntar:

> Isso ajuda o usuário a capturar, entender, recuperar ou agir sobre contexto essencial agora?

Se a resposta for não, fica para versão futura.


## Esclarecimento sobre finanças

Finanças simples são desejáveis, mas não são o núcleo indispensável da primeira prova de valor.

No MVP, finanças podem aparecer como capacidade inicial ou entidade preparada, desde que não atrasem captura, dashboard, projetos, diário/check-in e APIs para a Nyx.

## Esclarecimento sobre captura rápida

Captura rápida é parte essencial do MVP. Porém, ela pode nascer em uma versão mínima na Sprint 01 e amadurecer nas sprints seguintes.

A documentação oficial considera captura como capacidade central, não como funcionalidade opcional distante.
