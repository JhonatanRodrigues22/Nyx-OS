# Developer Experience Validation

## Objetivo

Garantir que qualquer pessoa consiga instalar, executar e validar o Nyx OS usando apenas a documentacao oficial do projeto.

Toda Sprint, hotfix, refactor ou mudanca significativa so pode ser considerada concluida quando o caminho de onboarding documentado continuar funcionando.

O nome do procedimento permanece em ingles por ser um termo tecnico consolidado no workflow do projeto. O conteudo normativo deve ser escrito em Portugues do Brasil.

## Escopo

A DX Validation cobre:

- leitura inicial do `README.md`;
- instalacao de dependencias;
- criacao do arquivo de ambiente local;
- execucao do servidor de desenvolvimento;
- execucao dos checks documentados;
- entendimento basico do workflow de contribuicao.

Ela nao substitui testes de produto, review tecnico, CI ou validacao manual de funcionalidades especificas.

## Como executar

1. Comece a partir de uma copia limpa do repositorio ou de um ambiente local sem dependencias instaladas.
2. Siga apenas o `README.md`.
3. Execute os comandos de instalacao descritos no Quick Start ou no setup completo.
4. Crie `apps/web/.env.local` a partir de `apps/web/.env.local.example`.
5. Execute o projeto com `npm run dev`.
6. Abra `http://localhost:3000` e confirme que a aplicacao carrega.
7. Interrompa o servidor local.
8. Execute os checks documentados:

```bash
npm run lint
npm test
npm run build
npm audit
```

9. Confirme que o README explica como contribuir e para onde consultar a documentacao oficial.

## Criterios de aprovacao

A DX Validation e aprovada quando:

- o README permite iniciar o projeto sem instrucoes externas;
- `npm install` conclui com sucesso;
- `apps/web/.env.local` pode ser criado a partir do exemplo documentado;
- `npm run dev` inicia o app localmente;
- a pagina inicial carrega em `http://localhost:3000`;
- `npm run lint` passa;
- `npm test` passa;
- `npm run build` passa;
- `npm audit` nao reporta vulnerabilidades que bloqueiem a Sprint;
- o workflow de Pull Request esta claro para um novo contribuidor.

## Criterios de reprovacao

A DX Validation reprova quando:

- alguma etapa necessaria para rodar o projeto esta implicita;
- um comando documentado esta incorreto ou incompleto;
- o projeto depende de um arquivo local nao documentado;
- o README aponta para caminhos que nao existem;
- o app nao inicia seguindo apenas a documentacao;
- checks obrigatorios falham sem justificativa registrada;
- o workflow de contribuicao fica ambiguo.

## Exemplos comuns de falha

- O README manda criar `.env.local`, mas nao informa o caminho correto.
- O projeto usa workspaces, mas a documentacao orienta executar comandos dentro da pasta errada.
- Uma variavel de ambiente obrigatoria nao aparece no arquivo de exemplo.
- O build depende de uma configuracao local nao versionada.
- A Pull Request usa uma branch baseada em outra Sprint sem autorizacao explicita.
- A branch temporaria permanece no repositorio depois do merge.

## Nota interna

Este procedimento tambem pode ser referido informalmente como "Teste do Dev Perneta". O nome informal reforca a ideia de que o onboarding deve funcionar mesmo sem contexto previo, atalhos locais ou conhecimento tribal.
