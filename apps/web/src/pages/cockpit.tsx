import Head from "next/head";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/cockpit-operational.module.css";

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

type CockpitTask = {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
  projectId?: string;
};

type CockpitProject = {
  id: string;
  name: string;
  status: "active" | "paused" | "completed" | "archived";
  description?: string;
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
  },
  {
    label: "Listar tarefas abertas",
    toolId: "task.listOpen"
  },
  {
    label: "Listar projetos ativos",
    toolId: "project.listActive"
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
  const [tasks, setTasks] = useState<CockpitTask[]>([]);
  const [projects, setProjects] = useState<CockpitProject[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskStatus, setTaskStatus] = useState("Pronto para capturar");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const assistantDraftRef = useRef("");

  const latestStatus = useMemo(() => events[0]?.name ?? "cockpit.idle", [events]);

  async function refreshPersonalData() {
    const [taskResponse, projectResponse] = await Promise.all([fetch("/api/tasks"), fetch("/api/projects")]);

    if (taskResponse.ok) {
      const payload = (await taskResponse.json()) as { tasks?: CockpitTask[] };

      setTasks(payload.tasks ?? []);
    }

    if (projectResponse.ok) {
      const payload = (await projectResponse.json()) as { projects?: CockpitProject[] };

      setProjects(payload.projects ?? []);
    }
  }

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

  useEffect(() => {
    void refreshPersonalData();
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
      const payload = (await response.json()) as {
        execution?: { status: string; result?: { total?: number } };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Comando falhou.");
      }

      const total = payload.execution?.result?.total;

      setCommandStatus(
        `${command.label}: ${payload.execution?.status ?? "ok"}${typeof total === "number" ? ` (${total})` : ""}`
      );

      if (command.toolId === "task.listOpen" || command.toolId === "project.listActive") {
        await refreshPersonalData();
      }
    } catch (error) {
      setCommandStatus(error instanceof Error ? error.message : "Comando falhou.");
    }
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = taskTitle.trim();

    if (!title || isCreatingTask) {
      return;
    }

    setIsCreatingTask(true);
    setTaskStatus("Capturando tarefa...");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          title,
          dueDate: taskDueDate || undefined,
          projectId: taskProjectId || undefined
        })
      });
      const payload = (await response.json()) as { task?: CockpitTask; error?: string };

      if (!response.ok || !payload.task) {
        throw new Error(payload.error ?? "Nao foi possivel criar a tarefa.");
      }

      setTaskTitle("");
      setTaskDueDate("");
      setTaskProjectId("");
      setTaskStatus(`Tarefa capturada: ${payload.task.title}`);
      await refreshPersonalData();
    } catch (error) {
      setTaskStatus(error instanceof Error ? error.message : "Nao foi possivel criar a tarefa.");
    } finally {
      setIsCreatingTask(false);
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
            <section className={styles.operationalPanel} aria-labelledby="quick-capture-title">
              <div>
                <p className="cockpit-kicker">Captura rapida</p>
                <h2 id="quick-capture-title">Tarefa</h2>
              </div>
              <form className={styles.taskCaptureForm} onSubmit={createTask}>
                <input
                  aria-label="Titulo da tarefa"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Nova tarefa..."
                />
                <input
                  aria-label="Data da tarefa"
                  type="date"
                  value={taskDueDate}
                  onChange={(event) => setTaskDueDate(event.target.value)}
                />
                <select
                  aria-label="Projeto da tarefa"
                  value={taskProjectId}
                  onChange={(event) => setTaskProjectId(event.target.value)}
                >
                  <option value="">Sem projeto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <button type="submit" disabled={isCreatingTask || taskTitle.trim().length === 0}>
                  {isCreatingTask ? "Salvando" : "Capturar"}
                </button>
              </form>
              <strong className="command-status">{taskStatus}</strong>
            </section>

            <section className={styles.operationalGrid} aria-label="Dados operacionais">
              <div className={styles.operationalPanel}>
                <p className="cockpit-kicker">Tarefas abertas</p>
                <ol className={styles.personalDataList}>
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <li key={task.id}>
                        <strong>{task.title}</strong>
                        <span>
                          {task.dueDate ?? "sem data"}
                          {task.projectId ? ` - ${projects.find((project) => project.id === task.projectId)?.name ?? task.projectId}` : ""}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="empty-row">Nenhuma tarefa aberta.</li>
                  )}
                </ol>
              </div>

              <div className={styles.operationalPanel}>
                <p className="cockpit-kicker">Projetos ativos</p>
                <ol className={styles.personalDataList}>
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <li key={project.id}>
                        <strong>{project.name}</strong>
                        <span>{project.description ?? project.status}</span>
                      </li>
                    ))
                  ) : (
                    <li className="empty-row">Nenhum projeto ativo.</li>
                  )}
                </ol>
              </div>
            </section>

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
