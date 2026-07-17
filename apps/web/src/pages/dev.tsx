import type { DashboardSnapshot } from "@nyx-os/core";
import { createDashboardSnapshotFromRuntime } from "@nyx-os/core";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CapabilityList } from "@/components/CapabilityList";
import { DashboardCardGrid } from "@/components/DashboardCardGrid";
import { EventList } from "@/components/EventList";
import { InfrastructurePanel } from "@/components/InfrastructurePanel";
import { LocalInstanceList } from "@/components/LocalInstanceList";
import { ModuleGrid } from "@/components/ModuleGrid";
import { PluginList } from "@/components/PluginList";
import { SchedulerList } from "@/components/SchedulerList";
import { StatusPanel } from "@/components/StatusPanel";
import { ToolList } from "@/components/ToolList";
import { getCockpitRuntime } from "@/server/cockpitRuntime";

type DevDashboardProps = {
  snapshot: DashboardSnapshot;
  enableLiveRuntime?: boolean;
};

export default function DevDashboard({ snapshot, enableLiveRuntime = true }: DevDashboardProps) {
  const [dashboardSnapshot, setDashboardSnapshot] = useState(snapshot);

  useEffect(() => {
    if (!enableLiveRuntime) {
      return undefined;
    }

    let mounted = true;
    const refresh = async () => {
      const response = await fetch("/api/dev/snapshot");

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { snapshot: DashboardSnapshot };

      if (mounted) {
        setDashboardSnapshot(payload.snapshot);
      }
    };
    const interval = window.setInterval(() => {
      void refresh();
    }, 1000);

    void refresh();

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [enableLiveRuntime]);

  return (
    <>
      <Head>
        <title>Nyx OS</title>
        <meta name="description" content="Painel de estado de desenvolvimento do Nyx OS." />
        <meta name="theme-color" content="#101418" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <AppShell navigation={dashboardSnapshot.navigation}>
        <section className="dashboard-hero" aria-labelledby="dashboard-title">
          <div>
            <p className="eyebrow">Dashboard de Desenvolvimento</p>
            <h1 id="dashboard-title">Nyx OS</h1>
            <p className="lead">
              Painel de estado visual para acompanhar Runtime, servicos, plugins, Scheduler e eventos internos.
            </p>
          </div>
          <StatusPanel overview={dashboardSnapshot.overview} status={dashboardSnapshot.systemStatus} />
        </section>

        <DashboardCardGrid cards={dashboardSnapshot.cards} />

        <section className="dashboard-grid" aria-label="Estado Atual">
          <div className="main-stack">
            <InfrastructurePanel overview={dashboardSnapshot.overview} modules={dashboardSnapshot.runtime.modules} />
            <ModuleGrid modules={dashboardSnapshot.runtime.modules} />
          </div>
          <div className="side-stack">
            <SchedulerList overview={dashboardSnapshot.overview} tasks={dashboardSnapshot.scheduler.tasks} />
            <LocalInstanceList localGateway={dashboardSnapshot.localGateway} />
            <CapabilityList
              overview={dashboardSnapshot.overview}
              capabilities={dashboardSnapshot.capabilities}
            />
            <ToolList overview={dashboardSnapshot.overview} tools={dashboardSnapshot.tools} />
            <PluginList overview={dashboardSnapshot.overview} plugins={dashboardSnapshot.plugins} />
            <EventList overview={dashboardSnapshot.overview} events={dashboardSnapshot.recentEvents} />
          </div>
        </section>
      </AppShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<DevDashboardProps> = async () => {
  const handle = getCockpitRuntime();

  await handle.ready;

  return {
    props: {
      snapshot: createDashboardSnapshotFromRuntime(handle.runtime)
    }
  };
};
