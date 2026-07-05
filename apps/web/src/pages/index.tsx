import type { DashboardSnapshot } from "@nyx-os/core";
import { createDashboardSnapshot } from "@nyx-os/core";
import Head from "next/head";
import { AppShell } from "@/components/AppShell";
import { DashboardCardGrid } from "@/components/DashboardCardGrid";
import { EventList } from "@/components/EventList";
import { ModuleGrid } from "@/components/ModuleGrid";
import { PluginList } from "@/components/PluginList";
import { StatusPanel } from "@/components/StatusPanel";

type HomeProps = {
  snapshot: DashboardSnapshot;
};

export default function Home({ snapshot }: HomeProps) {
  return (
    <>
      <Head>
        <title>Nyx OS</title>
        <meta
          name="description"
          content="Runtime base e dashboard inicial do Nyx OS."
        />
        <meta name="theme-color" content="#101418" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <AppShell navigation={snapshot.navigation}>
        <section className="dashboard-hero" aria-labelledby="dashboard-title">
          <div>
            <p className="eyebrow">Core Runtime</p>
            <h1 id="dashboard-title">Nyx OS</h1>
            <p className="lead">
              Runtime executável, serviços internos e dashboard base para o cockpit do sistema.
            </p>
          </div>
          <StatusPanel status={snapshot.systemStatus} runtime={snapshot.runtime} />
        </section>

        <DashboardCardGrid cards={snapshot.cards} />

        <section className="dashboard-grid" aria-label="Estado do sistema">
          <ModuleGrid modules={snapshot.runtime.modules} />
          <div className="side-stack">
            <PluginList plugins={snapshot.plugins} />
            <EventList events={snapshot.recentEvents} />
          </div>
        </section>
      </AppShell>
    </>
  );
}

export function getStaticProps() {
  return {
    props: {
      snapshot: createDashboardSnapshot()
    }
  };
}
