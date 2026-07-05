# Modelo de Dados Conceitual

Este documento descreve o modelo de dados conceitual do Nyx OS. Ele não define tabelas finais, migrations ou detalhes de implementação. Seu objetivo é orientar o desenho do domínio.

## Princípio central

O Nyx OS deve tratar dados como um **grafo de contexto**.

As entidades principais podem existir de forma independente, mas devem poder se conectar entre si por relações explícitas.

Exemplo:

```text
Nota
 ├── relacionada ao Projeto X
 ├── relacionada à Decisão Y
 ├── relacionada ao Dia Z
 └── relacionada à Memória W
```

Isso evita que o sistema fique rígido demais e permite que o contexto cresça com naturalidade.

## Entidades iniciais

### User

Representa o usuário principal do sistema.

No MVP, o produto nasce para um usuário real: JJ. Mesmo assim, a arquitetura não deve impedir evolução futura para mais usuários.

### Task

Uma ação concreta que pode ser concluída.

Campos conceituais:

- título;
- descrição;
- status;
- prioridade;
- data planejada;
- data de conclusão;
- relações com projetos, notas, memórias ou dias.

### Project

Unidade de continuidade para objetivos maiores.

Campos conceituais:

- nome;
- descrição;
- status;
- objetivo;
- próximos passos;
- decisões associadas;
- tarefas associadas;
- notas e memórias relacionadas.

### Note

Registro livre de informação.

Pode existir sozinha ou conectada a outras entidades.

### Decision

Registro de uma escolha feita.

Deve preservar:

- decisão tomada;
- contexto;
- motivo;
- data;
- impacto;
- entidades relacionadas.

### Memory

Informação persistente importante para contexto futuro.

No nível técnico, memória pode ser representada como uma entidade própria, mas no nível de experiência ela deve aparecer como parte viva da casa do usuário.

### DailyCheckin

Registro de estado, resumo ou observações de um dia.

Pode se conectar a tarefas, projetos, hábitos, emoções, eventos e decisões.

### Habit

Comportamento recorrente que o usuário deseja acompanhar.

No MVP pode começar simples e evoluir depois.

### FinanceRecord

Registro financeiro simples.

Finanças são desejáveis, mas não fazem parte do núcleo indispensável da primeira prova de valor. Devem ser tratadas como prioridade média.

### Relation

Representa uma conexão entre duas entidades.

Campos conceituais:

- entidade de origem;
- entidade de destino;
- tipo de relação;
- contexto opcional;
- data de criação.

Exemplos de relação:

- `pertence_a`;
- `relacionado_a`;
- `bloqueia`;
- `decidido_em`;
- `gerou`;
- `referencia`;
- `continua_em`.

## Banco de dados vs experiência

O banco pode tratar informações como registros estruturados. Porém, o cockpit não deve parecer apenas uma lista de tabelas.

Na experiência do usuário, o Nyx OS deve parecer uma casa:

- com áreas vivas;
- com memória;
- com continuidade;
- com estado atual;
- com histórico;
- com sinais do que importa agora.

## Regra de modelagem

Quando surgir uma nova entidade, perguntar:

1. Ela precisa existir sozinha?
2. Ela precisa se relacionar com outras entidades?
3. Ela representa ação, informação, decisão, estado ou contexto?
4. Ela ajuda a Nyx a entender melhor a vida operacional do usuário?

Se a resposta for sim, ela provavelmente deve entrar no grafo de contexto.
