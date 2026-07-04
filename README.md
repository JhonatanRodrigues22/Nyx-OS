# Nyx OS

Nyx OS e um sistema operacional pessoal para capturar, armazenar e recuperar dados pessoais com o minimo de atrito: tarefas, projetos, habitos, financas, check-ins, notas, decisoes e memorias.

Esta Sprint 0 cria a fundacao tecnica: Next.js com TypeScript, Supabase para banco/autenticacao, PWA para uso mobile, tipos iniciais do dominio, stubs de API e testes basicos.

## Fonte de verdade

A pasta local `/Fundamentos/` contem as diretrizes, arquitetura e decisoes do Nyx OS. Ela e a fonte de verdade do projeto e deve ser consultada antes de mudancas arquiteturais.

Essa pasta e excluida do git porque pode conter documentos pessoais. Mantenha documentos de arquitetura, decisoes e ajustes de direcao dentro de `/Fundamentos/`, mas nao os versione.

## Requisitos

- Node.js 20 ou superior
- npm
- Uma conta no Supabase free tier

## Rodando localmente

1. Instale as dependencias:

```bash
npm install
```

2. Crie um projeto no Supabase free tier.

3. Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

4. Preencha as variaveis em `.env.local`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

5. Rode o servidor local:

```bash
npm run dev
```

6. Acesse `http://localhost:3000`.

## Supabase

O cliente esta configurado em `src/lib/supabase.ts`. A chave esperada nesta fase e a `anon public key`, adequada para uso com Row Level Security quando as tabelas forem criadas.

As APIs iniciais em `src/pages/api/` retornam `501 Not implemented`; elas existem para fixar o contrato inicial de CRUD de tarefas e projetos e mostrar o ponto de integracao com a Nyx Assistente.

## Captura rapida

A home tem um botao flutuante `+` que abre `/capture`. Nessa tela e possivel registrar rapidamente:

- tarefas;
- notas ou ideias;
- entradas financeiras;
- decisoes.

O formulario muda conforme o tipo selecionado e envia os dados para `/api/capture`, que valida o corpo e insere na tabela correspondente do Supabase.

## PWA

O projeto inclui `next-pwa` e um manifesto basico em `public/manifest.json`. Em desenvolvimento o service worker fica desativado; em build de producao ele e gerado automaticamente.

## Testes

```bash
npm test
```

## Deploy

### Vercel

1. Conecte o repositorio na Vercel.
2. Configure `SUPABASE_URL` e `SUPABASE_KEY` nas variaveis de ambiente do projeto.
3. Use o build padrao do Next.js.

### Supabase

Use o Supabase free tier para banco de dados e autenticacao. A hospedagem da aplicacao Next.js pode ficar na Vercel; futuramente, funcoes especificas podem ser movidas para Supabase Edge Functions quando fizer sentido.

## Scripts auxiliares

A pasta `scripts/` e local e excluida do git. Ela contem utilitarios de desenvolvimento, como `scripts/package.py`, que gera um pacote compartilhavel sem arquivos pessoais, dependencias instaladas ou artefatos de build.
