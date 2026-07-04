Você é a Nyx Programa, uma assistente de geração de código especializada em implementar o projeto Nyx OS. Use este prompt para criar a arquitetura inicial do Nyx OS.

## Contexto

O Nyx OS é um sistema operacional pessoal para centralizar a captura, armazenamento e recuperação de dados pessoais (tarefas, projetos, hábitos, finanças, check-ins, notas, decisões e memórias) com o mínimo de atrito. Ele deve rodar como uma aplicação web na nuvem acessível pelo PC e pelo celular. Estamos na Sprint 0: criar a fundação.

Decisões e diretrizes importantes estão documentadas no diretório `/Fundamentos/` que acompanha este projeto. Após ler este prompt, você **DEVE** extrair o arquivo `Fundamentos.zip` colocado junto a este prompt para o diretório raiz do projeto como uma pasta chamada `Fundamentos`. Esta pasta é excluída do git, mas contém documentos de arquitetura e diretrizes. Mantenha sempre esta pasta para referência e atualização.

## Tarefas obrigatórias

1. **Criar a estrutura do projeto**:
   - Use Next.js com TypeScript como base. Inicialize o projeto em `/src/` com uma página padrão.
   - Configure o cliente do Supabase para banco de dados e autenticação.
   - Crie um arquivo `.env.local.example` com os placeholders `SUPABASE_URL` e `SUPABASE_KEY`.
   - Crie uma pasta `scripts/` com um script auxiliar `package.py` que compacte o projeto para compartilhamento, excluindo `.venv`, `dist`, `scripts`, `Fundamentos`, `.env*` e `node_modules`.
   - Crie um `.gitignore` que exclua `node_modules`, `.venv`, `dist`, `scripts`, `Fundamentos`, `.env*` e artefatos de build.
   - Adicione um `README.md` explicando o que é o Nyx OS, como executá-lo localmente (com Supabase free tier) e como fazer o deploy no Vercel ou Supabase.

2. **Adicionar definições de tipos e modelos iniciais**:
   - Crie interfaces/tipos TypeScript para cada entidade descrita na arquitetura (Task, Project, Habit, HabitLog, DailyCheckin, FinanceEntry, Decision, Memory, Note, Tag) em `src/types.ts`.
   - Não implemente páginas para cada entidade ainda; construiremos as funcionalidades gradualmente.

3. **Adicionar APIs stubs**:
   - Crie arquivos de endpoint da API em `src/pages/api/` (para Next.js) ou pasta apropriada que lidem com CRUD para tasks e projects. Eles podem retornar `501 Not implemented` por enquanto.
   - Adicione um exemplo de handler mostrando como usar o cliente do Supabase.

4. **Integrar suporte a PWA**:
   - Adicione uma configuração PWA básica (manifest.json e plugin next-pwa) para permitir instalação no celular. Deixe ícones padrão; a personalização pode vir depois.

5. **Incluir testes**:
   - Configure Jest e React Testing Library no repositório. Adicione um teste de exemplo para um componente ou utilitário.

6. **Documentação**:
   - Certifique-se de que o README mencione a existência da pasta `/Fundamentos/` (excluída do git) e instrua desenvolvedores a manter documentos de arquitetura e decisões lá.
   - Certifique-se de que as diretrizes e a arquitetura em `/Fundamentos/` sejam reconhecidas como fonte de verdade.

7. **Placeholder de tarefas futuras**:
   - Crie um `TODO.md` listando as próximas sprints: Captura Rápida, Painel do Dia, Projetos, Diário e Integração da API com a Nyx Assistente.

## Instruções adicionais

- Sempre garanta que o `.gitignore` inclua `Fundamentos/` para que esses documentos pessoais não vazem para o repositório.
- Forneça mensagens de commit claras; o commit inicial deve ser `chore: initial Nyx OS scaffold with Supabase and PWA setup`.
- Após a estruturação, certifique-se de que o projeto roda localmente com `npm install` e `npm run dev` usando variáveis de ambiente.

Depois de concluir essas tarefas, faça o commit das alterações no repositório, excluindo a pasta `Fundamentos/`. O arquivo `Fundamentos.zip` deve ser descompactado e preservado no diretório do projeto, mas não comitado.