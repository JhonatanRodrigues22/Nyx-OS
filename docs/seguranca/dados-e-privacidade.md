# Dados, Segurança e Privacidade

## Contexto

O Nyx OS lida com dados pessoais, rotina, projetos, decisões, memórias, notas, hábitos, finanças e contexto íntimo do usuário.

Por isso, segurança e privacidade não são detalhes cosméticos. Elas fazem parte da identidade do produto.

## Filosofia

O usuário considera aceitável que a Nyx acesse informações presentes no Nyx OS, porque a premissa é: se algo foi colocado no sistema, é porque pode ser usado para ajudar.

Isso não significa ausência de cuidado. Significa que o sistema deve equilibrar acesso útil com rastreabilidade, clareza e segurança.

## Princípios

### 1. Dados pertencem ao usuário

O Nyx OS existe para servir o usuário, não para prender dados em uma estrutura opaca.

### 2. IA pode acessar contexto, mas não deve agir sem limites

Consultar contexto é diferente de executar ações destrutivas.

Ações futuras como apagar, enviar, publicar, alterar registros críticos ou operar integrações sensíveis podem exigir confirmação.

### 3. Evitar exposição desnecessária

Mesmo que a versão inicial rode em nuvem, a arquitetura deve minimizar riscos de vazamento.

### 4. Longo prazo local-first

A visão futura inclui rodar o Nyx OS em ambiente próprio, reduzindo dependência de serviços pagos e exposição de dados.

No MVP, isso é uma direção, não uma exigência técnica.

## Dados sensíveis

Exemplos de dados que podem aparecer no Nyx OS:

- saúde mental;
- finanças;
- relações pessoais;
- espiritualidade;
- rotina;
- localização aproximada;
- trabalho;
- projetos privados;
- histórico emocional;
- decisões importantes.

## Regras iniciais

- Não registrar segredos técnicos em texto puro quando houver alternativa melhor.
- Evitar logs com dados pessoais desnecessários.
- Separar dados de configuração de dados do usuário.
- Projetar APIs com autenticação.
- Documentar ações automáticas feitas pela IA.
- Evitar permissões excessivas sem necessidade.

## Fora do MVP

No MVP, não é obrigatório construir um sistema avançado de permissões, criptografia customizada ou auditoria completa.

Mas o projeto deve ser escrito de forma que essas camadas possam ser adicionadas no futuro.
