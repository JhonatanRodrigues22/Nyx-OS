import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useMemo, useState } from "react";
import type { CaptureKind } from "@/lib/capture";

const captureOptions: Array<{ kind: CaptureKind; label: string }> = [
  { kind: "task", label: "Tarefa" },
  { kind: "note", label: "Nota" },
  { kind: "finance", label: "Financa" },
  { kind: "decision", label: "Decisao" }
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function CapturePage() {
  const router = useRouter();
  const [kind, setKind] = useState<CaptureKind>("task");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultDate = useMemo(() => today(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Nao foi possivel registrar a captura.");
      }

      await router.push(`/?captured=${kind}`);
    } catch (captureError) {
      setError(
        captureError instanceof Error
          ? captureError.message
          : "Nao foi possivel registrar a captura."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Captura Rapida | Nyx OS</title>
        <meta name="description" content="Registre rapidamente informacoes no Nyx OS." />
      </Head>
      <main className="shell capture-shell">
        <section className="capture-header" aria-labelledby="capture-title">
          <p className="eyebrow">Captura Rapida</p>
          <h1 id="capture-title">Registrar agora</h1>
          <p className="lead">Escolha o tipo, preencha o minimo necessario e volte ao fluxo.</p>
        </section>

        <form className="capture-form" onSubmit={handleSubmit}>
          <fieldset className="segmented-control" aria-label="Tipo de captura">
            {captureOptions.map((option) => (
              <label key={option.kind}>
                <input
                  type="radio"
                  name="kind"
                  value={option.kind}
                  checked={kind === option.kind}
                  onChange={() => setKind(option.kind)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>

          {kind === "task" && (
            <section className="form-grid" aria-label="Formulario de tarefa">
              <label className="field field-full">
                <span>Titulo</span>
                <input name="title" required autoFocus placeholder="O que precisa acontecer?" />
              </label>
              <label className="field field-full">
                <span>Descricao</span>
                <textarea name="description" rows={4} placeholder="Contexto rapido" />
              </label>
              <label className="field">
                <span>Prioridade</span>
                <select name="priority" defaultValue="medium">
                  <option value="low">Baixa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </label>
              <label className="field">
                <span>Data limite</span>
                <input name="date_due" type="date" />
              </label>
              <label className="field field-full">
                <span>Projeto</span>
                <input name="project_id" placeholder="ID do projeto, opcional" />
              </label>
            </section>
          )}

          {kind === "note" && (
            <section className="form-grid" aria-label="Formulario de nota">
              <label className="field field-full">
                <span>Nota ou ideia</span>
                <textarea
                  name="content"
                  required
                  autoFocus
                  rows={7}
                  placeholder="Escreva antes que escape."
                />
              </label>
            </section>
          )}

          {kind === "finance" && (
            <section className="form-grid" aria-label="Formulario financeiro">
              <label className="field">
                <span>Tipo</span>
                <select name="type" defaultValue="expense">
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </label>
              <label className="field">
                <span>Categoria</span>
                <input name="category" required placeholder="Mercado, cliente, casa..." />
              </label>
              <label className="field">
                <span>Valor</span>
                <input name="amount" type="number" min="0.01" step="0.01" required />
              </label>
              <label className="field">
                <span>Data</span>
                <input name="date" type="date" required defaultValue={defaultDate} />
              </label>
              <label className="field field-full">
                <span>Descricao</span>
                <textarea name="description" rows={4} placeholder="Detalhe opcional" />
              </label>
              <label className="field field-full">
                <span>Projeto</span>
                <input name="project_id" placeholder="ID do projeto, opcional" />
              </label>
            </section>
          )}

          {kind === "decision" && (
            <section className="form-grid" aria-label="Formulario de decisao">
              <label className="field field-full">
                <span>Decisao</span>
                <textarea
                  name="description"
                  required
                  autoFocus
                  rows={5}
                  placeholder="O que foi decidido?"
                />
              </label>
              <label className="field">
                <span>Data</span>
                <input name="date" type="date" required defaultValue={defaultDate} />
              </label>
            </section>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={() => router.push("/")}>
              Cancelar
            </button>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar captura"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
