import Head from "next/head";
import { StatusCard } from "@/components/StatusCard";

export default function Home() {
  return (
    <>
      <Head>
        <title>Nyx OS</title>
        <meta
          name="description"
          content="Sistema operacional pessoal para capturar, organizar e recuperar dados pessoais."
        />
        <meta name="theme-color" content="#111827" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <main className="shell">
        <section className="hero" aria-labelledby="page-title">
          <p className="eyebrow">Sprint 0</p>
          <h1 id="page-title">Nyx OS</h1>
          <p className="lead">
            Fundacao pronta para capturar tarefas, projetos, habitos, financas,
            check-ins, notas, decisoes e memorias com o minimo de atrito.
          </p>
        </section>

        <section className="grid" aria-label="Estado da fundacao">
          <StatusCard title="Next.js" description="Aplicacao web tipada em TypeScript." />
          <StatusCard title="Supabase" description="Cliente preparado para banco e autenticacao." />
          <StatusCard title="PWA" description="Manifesto e service worker para instalacao mobile." />
        </section>
      </main>
    </>
  );
}
