import Head from "next/head";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ExecutionEvent = {
  id: string;
  name: string;
  timestamp: string;
  source: string;
  status: string;
};

type QuickCommand = {
  label: string;
  toolId: string;
  input?: unknown;
};

const quickCommands: QuickCommand[] = [
  {
    label: "Diagnostico do runtime",
    toolId: "diagnostics.runtime"
  },
  {
    label: "Buscar memoria: runtime",
    toolId: "memory.search",
    input: {
      text: "runtime"
    }
  }
];

function parseSsePayload(rawEvent: string): { event: string; data: unknown } | null {
  const lines = rawEvent.split("\n");
  const event = lines.find((line) => line.startsWith("event: "))?.slice(7) ?? "message";
  const dataLine = lines.find((line) => line.startsWith("data: "));

  if (!dataLine) {
    return null;
  }

  return {
    event,
    data: JSON.parse(dataLine.slice(6)) as unknown
  };
}

export default function CockpitPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Nyx online. Me diga o que precisa orquestrar agora."
    }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [commandStatus, setCommandStatus] = useState<string>("Pronto");
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const assistantDraftRef = useRef("");

  const latestStatus = useMemo(() => events[0]?.name ?? "cockpit.idle", [events]);

  useEffect(() => {
    const source = new EventSource("/api/cockpit/events");

    source.addEventListener("nyx", (event) => {
      const nextEvent = JSON.parse((event as MessageEvent).data) as ExecutionEvent;

      setEvents((current) => [nextEvent, ...current].slice(0, 8));
    });
    source.onerror = () => {
      setEvents((current) => [
        {
          id: `cockpit.events.error:${Date.now()}`,
          name: "cockpit.events.error",
          timestamp: new Date().toISOString(),
          source: "cockpit",
          status: "error"
        },
        ...current
      ].slice(0, 8));
    };

    return () => {
      source.close();
    };
  }, []);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || isStreaming) {
      return;
    }

    setInput("");
    setChatError(null);
    setIsStreaming(true);
    assistantDraftRef.current = "";
    setMessages((current) => [
      ...current,
      { role: "user", content: trimmed },
      { role: "assistant", content: "" }
    ]);

    try {
      const response = await fetch("/api/cockpit/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ message: trimmed })
      });

      if (!response.ok || !response.body) {
        throw new Error("Falha ao iniciar streaming da Nyx.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");

        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const payload = parseSsePayload(part);

          if (!payload) {
            continue;
          }

          if (payload.event === "chunk") {
            const data = payload.data as { content?: string };

            assistantDraftRef.current += data.content ?? "";
            setMessages((current) =>
              current.map((message, index) =>
                index === current.length - 1 ? { ...message, content: assistantDraftRef.current } : message
              )
            );
          }

          if (payload.event === "tool_call") {
            const data = payload.data as { toolId?: string };

            setCommandStatus(`Tool solicitada: ${data.toolId ?? "desconhecida"}`);
          }

          if (payload.event === "error") {
            const data = payload.data as { error?: string };

            throw new Error(data.error ?? "Falha tratada no provider de IA.");
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado no chat.";

      setChatError(message);
      setMessages((current) =>
        current.map((entry, index) => (index === current.length - 1 ? { ...entry, content: message } : entry))
      );
    } finally {
      setIsStreaming(false);
    }
  }

  async function runQuickCommand(command: QuickCommand) {
    setCommandStatus(`Executando ${command.label}...`);

    try {
      const response = await fetch("/api/cockpit/commands", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          toolId: command.toolId,
          input: command.input
        })
      });
      const payload = (await response.json()) as { execution?: { status: string }; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Comando falhou.");
      }

      setCommandStatus(`${command.label}: ${payload.execution?.status ?? "ok"}`);
    } catch (error) {
      setCommandStatus(error instanceof Error ? error.message : "Comando falhou.");
    }
  }

  return (
    <>
      <Head>
        <title>Nyx Cockpit</title>
        <meta name="description" content="Cockpit pessoal de interacao com a Nyx." />
        <meta name="theme-color" content="#080714" />
      </Head>
      <main className="cockpit-shell">
        <section className="cockpit-hero" aria-labelledby="cockpit-title">
          <div>
            <p className="cockpit-kicker">Nyx Interaction Layer</p>
            <h1 id="cockpit-title">Cockpit</h1>
            <p>
              Chat, comandos deterministas e telemetria de execucao em uma experiencia propria, separada do Dev Dashboard.
            </p>
          </div>
          <div className="cockpit-core" aria-label="Estado do cockpit">
            <span>{isStreaming ? "STREAMING" : "ONLINE"}</span>
            <strong>{latestStatus}</strong>
          </div>
        </section>

        <section className="cockpit-layout" aria-label="Console de interacao">
          <div className="chat-window">
            <div className="chat-history" aria-live="polite">
              {messages.map((message, index) => (
                <article className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                  <span>{message.role}</span>
                  <p>{message.content || (isStreaming && index === messages.length - 1 ? "Nyx esta respondendo..." : "")}</p>
                </article>
              ))}
            </div>
            {chatError ? <p className="cockpit-error">{chatError}</p> : null}
            <form className="chat-form" onSubmit={sendMessage}>
              <input
                aria-label="Mensagem para Nyx"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escreva para a Nyx..."
              />
              <button type="submit" disabled={isStreaming || input.trim().length === 0}>
                {isStreaming ? "Transmitindo" : "Enviar"}
              </button>
            </form>
          </div>

          <aside className="cockpit-side">
            <section className="cockpit-panel">
              <p className="cockpit-kicker">Comandos rapidos</p>
              <div className="quick-command-list">
                {quickCommands.map((command) => (
                  <button key={command.toolId} type="button" onClick={() => void runQuickCommand(command)}>
                    {command.label}
                  </button>
                ))}
              </div>
              <strong className="command-status">{commandStatus}</strong>
            </section>

            <section className="cockpit-panel">
              <p className="cockpit-kicker">Execucao ao vivo</p>
              <ol className="execution-feed">
                {events.map((event) => (
                  <li key={event.id}>
                    <strong>{event.name}</strong>
                    <span>{event.source}</span>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </section>
      </main>
    </>
  );
}
