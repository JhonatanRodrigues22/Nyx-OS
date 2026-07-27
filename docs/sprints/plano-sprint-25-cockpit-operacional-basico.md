# Plano Sprint 25 - Cockpit Operacional Basico

## Objetivo

Transformar o Cockpit em uma primeira experiencia operacional diaria, conectando a interface principal do Nyx OS a dados reais de tarefas e projetos.

Esta sprint deve cruzar a linha entre runtime arquitetado e produto utilizavel, sem expandir infraestrutura alem do necessario.

## Contexto

O projeto ja possui:

- rota `/cockpit` como interface principal;
- rota `/dev` como Dev Dashboard tecnico;
- `@nyx-os/personal-data` com repositorios para tarefas, habitos, projetos e financas;
- `@nyx-os/tools` com execucao deterministica;
- `@nyx-os/ai` com provider abstraido;
- Supabase definido como persistencia inicial dos modulos pessoais;
- documentacao arquitetural e ADRs para runtime, tools, AI, personal data e interaction layer.

O proximo passo e expor um recorte pequeno desses fundamentos no uso diario.

## Escopo

### Produto

- Captura rapida de tarefa no Cockpit.
- Listagem de tarefas abertas no Cockpit.
- Listagem de projetos ativos no Cockpit.
- Feedback visual simples para sucesso e falha.

### Backend

- API server-side para criar tarefa.
- API server-side para listar tarefas abertas.
- API server-side para listar projetos ativos.
- Uso dos repositorios de `@nyx-os/personal-data`.

### Tools

- Tool `task.create` para criar tarefa por contrato.
- Tool `task.listOpen` para listar tarefas abertas.
- Tool `project.listActive` para listar projetos ativos.

### Documentacao

- Atualizar README ou docs de arquitetura se houver nova rota, novo contrato ou nova variavel de ambiente.
- Registrar limitacoes conhecidas da persistencia inicial.
- Atualizar changelog da sprint ao final.

## Fora do escopo

- UI completa de habitos.
- UI financeira.
- Recorrencia de tarefas.
- Multiplos usuarios.
- Permissoes avancadas.
- Sincronizacao com Nyx Local.
- Embeddings, busca semantica ou grafo visual.
- Automacoes locais de sistema operacional.

## Criterios de aceite

- O usuario consegue abrir `/cockpit`.
- O usuario consegue criar uma tarefa pela interface.
- A tarefa criada aparece na listagem de tarefas abertas.
- Projetos ativos podem ser listados no Cockpit.
- Pelo menos uma Tool de produto pode ser executada via comando deterministico.
- O comportamento novo possui testes proporcionais ao risco.
- A documentacao relevante foi atualizada.
- `npm run lint`, `npm test` e `npm run build` passam ou possuem bloqueio registrado.

## Plano de implementacao

1. Revisar contratos atuais de `@nyx-os/personal-data`.
2. Definir o menor modelo de input para criar tarefa.
3. Criar camada server-side no app web para tarefas e projetos.
4. Registrar Tools de produto no runtime.
5. Atualizar `/cockpit` para exibir captura e listas.
6. Adicionar testes de API, Tools e interface.
7. Atualizar documentacao e changelog.
8. Validar localmente.
9. Commitar, publicar branch e abrir PR.

## Riscos

- Supabase sem credenciais reais pode exigir fallback em memoria para desenvolvimento.
- O Cockpit pode ficar acoplado demais a detalhes de storage se APIs server-side nao forem bem delimitadas.
- O chat com IA pode falhar sem `ANTHROPIC_API_KEY`; comandos determiniscos devem continuar uteis mesmo sem provider de IA.

## Decisao de produto

O Cockpit deve continuar sendo a superficie principal do usuario final.

O Dev Dashboard deve permanecer tecnico e separado em `/dev`.
