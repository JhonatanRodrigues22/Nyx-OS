# @nyx-os/events

Responsável por eventos de domínio e comunicação interna desacoplada.

O Event Bus inicial é em memória e permite:

- emitir eventos;
- listar eventos recentes;
- assinar eventos por tipo;
- assinar todos os eventos com `*`;
- cancelar assinaturas.

Eventos devem favorecer rastreabilidade e automações futuras sem acoplar serviços diretamente.
