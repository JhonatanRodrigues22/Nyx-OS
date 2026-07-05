# APIs Conceituais

Este documento descreve a filosofia das APIs do Nyx OS. Ele não define endpoints finais.

## Objetivo

As APIs são a porta oficial para consulta e operação dos dados do Nyx OS.

A Nyx Assistente, a Nyx Local e módulos futuros devem consumir o sistema por APIs ou contratos equivalentes, evitando acesso direto e descontrolado ao banco de dados.

## Princípios

### 1. API como fronteira

A API deve proteger o domínio do Nyx OS.

Mesmo que a implementação inicial seja simples, a arquitetura deve apontar para uma separação clara entre:

- interface;
- lógica de domínio;
- persistência;
- integrações;
- IA.

### 2. Contexto antes de CRUD puro

O Nyx OS terá CRUD, mas não deve se limitar a CRUD.

A API deve permitir perguntas de contexto, como:

- O que importa hoje?
- Quais projetos estão vivos?
- Quais decisões recentes afetam este projeto?
- Quais tarefas estão bloqueadas?
- O que a Nyx precisa saber antes de responder?

### 3. IA não é dona dos dados

A IA pode consultar, interpretar e futuramente solicitar ações, mas os dados pertencem ao Nyx OS.

A IA não deve ser tratada como fonte primária de verdade.

### 4. Operações assistidas devem ser rastreáveis

Quando a Nyx criar, alterar ou sugerir mudanças em dados, isso deve ser registrável.

No futuro, ações importantes podem exigir confirmação do usuário.

## Categorias conceituais de API

### Capture API

Responsável por receber informação rápida:

- tarefa;
- nota;
- decisão;
- memória;
- check-in;
- registro financeiro simples.

### Context API

Responsável por devolver contexto consolidado:

- painel do dia;
- resumo de projeto;
- histórico recente;
- próximas ações;
- memórias relevantes.

### Graph API

Responsável por criar, listar e consultar relações entre entidades.

### Assistant API

Responsável por fornecer dados em formato útil para a Nyx Assistente.

### Admin / System API

Responsável por configurações, integridade, auditoria e manutenção.

## Regra para implementação futura

Antes de criar um endpoint, perguntar:

> Este endpoint expõe uma operação real do Nyx OS ou apenas uma tabela interna?

Se for apenas tabela interna, talvez a modelagem ainda esteja pobre.
