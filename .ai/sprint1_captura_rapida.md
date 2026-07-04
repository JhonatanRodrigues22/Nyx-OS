Você é a Nyx Programa, continue o desenvolvimento do Nyx OS a partir do commit b1661b0.

**Objetivo da Sprint 1: Implementar o fluxo de Captura Rápida.**

## Contexto

O usuário quer registrar informações rapidamente sem atrito. Já existem as tabelas e tipos definidas em `src/types.ts`, e stubs de APIs. Crie uma funcionalidade de captura rápida que permita ao usuário registrar um novo item de forma intuitiva e eficiente.

## Requisitos

1. **Botão de Captura no Dashboard**:
   - Na página inicial (`src/pages/index.tsx`), adicione um botão flutuante (por exemplo, um `+`) fixado no canto inferior direito que navegue para a nova página de captura.

2. **Página de Captura (`src/pages/capture.tsx`)**:
   - Crie uma página com UI simples para registrar:
     - **Tarefa** (`Task`): campos `title`, `description`, `priority`, `date_due` opcional e `project_id` opcional.
     - **Nota/Ideia** (`Note`): campo `content`.
     - **Entrada financeira** (`FinanceEntry`): campos `type` (income/expense), `category`, `description`, `amount`, `date` e `project_id` opcional.
     - **Decisão** (`Decision`): campos `description` e `date`.
   - A seleção do tipo deve alterar o formulário de forma dinâmica.
   - Use o Supabase client (`src/lib/supabase.ts`) para inserir o registro na tabela correspondente usando `insert`.
   - Após a criação, redirecione o usuário de volta à home com uma mensagem de sucesso (pode ser um toast simples ou alert).

3. **API**:
   - Se necessário, expanda os endpoints em `src/pages/api/` para permitir criação a partir do frontend (por exemplo, `/api/capture` que roteia para o tipo correto).
   - Os endpoints devem validar o corpo e retornar erro adequado em caso de falha.

4. **UI e UX**:
   - Mantenha o design minimalista usando CSS Modules ou Tailwind (já configurado se aplicável).
   - Campo de data deve usar um input `type="date"`.
   - Mostre validações básicas (por exemplo, título obrigatório para tarefas).

5. **Testes**:
   - Adicione testes para verificar se o botão de captura aparece na home e se a página de captura renderiza para cada tipo de item.
   - Teste que a função de criação chama a API de inserção correta.

6. **Documentação**:
   - Atualize `TODO.md` removendo a tarefa "Captura Rápida" e adicionando qualquer tarefa de refinamento necessária.
   - Atualize o `README.md` com instruções breves de como usar a captura rápida.

## Observações
- Mantenha as pastas ignoradas e a estrutura existente.
- Não inclua a pasta `Fundamentos/` no git.
