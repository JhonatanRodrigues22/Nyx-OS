# Prompt Engine

## Objetivo

O Prompt Engine e o mecanismo oficial para registrar, versionar, renderizar e compor prompts no Nyx OS.

Ele substitui prompts de sistema hardcoded por templates declarativos com variaveis explicitas.

Ele nao decide qual contexto deve entrar no prompt, nao busca documentos e nao implementa conhecimento. Essas responsabilidades pertencem a engines futuras.

## Package

O package oficial e `@nyx-os/prompt`.

Ele contem:

- `PromptTemplate`;
- `PromptSection`;
- `PromptRegistry`;
- `PromptRenderer`;
- `PromptComposer`;
- tipos publicos de variaveis e referencias de template.

## Contratos

`PromptTemplate` declara:

- `id`;
- `version`;
- `description`;
- `template`;
- `variables`.

O campo `template` usa `{{variavel}}` como sintaxe de substituicao.

O campo `variables` e a lista explicita das variaveis obrigatorias para renderizar o template.

`PromptSection` declara:

- `name`;
- `content`.

Sections sao fragmentos ja renderizados que podem ser combinados em uma ordem definida pelo consumidor.

## Registry

`PromptRegistry` registra templates por combinacao `id` + `version`.

Registrar a mesma combinacao duas vezes gera erro explicito.

O registry permite buscar:

- por `id` + `version` especifica;
- por `id` sozinho, retornando a versao mais recente.

A resolucao de versao mais recente compara partes numericas separadas por ponto quando possivel.

## Renderer

`PromptRenderer` recebe um `PromptTemplate` e um objeto de variaveis.

Ele substitui marcadores `{{variavel}}` pelos valores recebidos.

Se uma variavel declarada em `template.variables` nao estiver presente no objeto de variaveis, o renderer lanca erro explicito.

O renderer nao preenche buracos silenciosamente.

## Composer

`PromptComposer` combina multiplas `PromptSection` na ordem informada.

O separador padrao entre secoes e uma linha em branco.

O composer nao interpreta o conteudo das secoes. Ele apenas monta o texto final.

## Relacao Com AI Runtime

`AiConversationManager` continua aceitando `systemPrompt` direto para compatibilidade.

Tambem aceita, de forma opcional, uma referencia de template e um resolver injetado:

```ts
new AiConversationManager({
  providers,
  tools,
  systemPromptTemplate: {
    id: "nyx.system",
    version: "1.0.0",
    variables: {
      name: "Nyx OS"
    }
  },
  systemPromptResolver
})
```

O package `@nyx-os/ai` nao depende obrigatoriamente de `@nyx-os/prompt`.

A fronteira entre eles e uma interface simples de injecao: o AI Runtime pede um system prompt renderizado, mas nao conhece a implementacao do registry, renderer ou composer.

## Fora do Escopo

- Busca de conteudo para variaveis.
- Knowledge Engine.
- Context Engine.
- UI de edicao de prompts.
- Templates reais de produto.
- Persistencia duravel de templates.
- Versionamento remoto.
