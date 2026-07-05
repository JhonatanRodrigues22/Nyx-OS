import type { DashboardSnapshot } from "@nyx-os/core";
import { createDashboardSnapshot, createDashboardSnapshotFromRuntime, NyxRuntime } from "@nyx-os/core";
import type { NyxSystemEventName } from "@nyx-os/event-bus";
import Head from "next/head";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DashboardCardGrid } from "@/components/DashboardCardGrid";
import { EventList } from "@/components/EventList";
import { InfrastructurePanel } from "@/components/InfrastructurePanel";
import { ModuleGrid } from "@/components/ModuleGrid";
import { PluginList } from "@/components/PluginList";
import { SchedulerList } from "@/components/SchedulerList";
import { StatusPanel } from "@/components/StatusPanel";

type HomeProps = {
  snapshot: DashboardSnapshot;
  enableLiveRuntime?: boolean;
};

const observedEvents: NyxSystemEventName[] = [
  "runtime.started",
  "runtime.stopped",
  "runtime.failed",
  "service.registered",
  "service.started",
  "service.stopped",
  "service.failed",
  "plugin.registered",
  "plugin.initialized",
  "plugin.disposed",
  "plugin.unregistered",
  "plugin.failed",
  "scheduler.started",
  "scheduler.stopped",
  "scheduler.task.registered",
  "scheduler.task.executed",
  "scheduler.task.failed",
  "scheduler.task.removed"
];

export default function Home({ snapshot, enableLiveRuntime = true }: HomeProps) {
  const [dashboardSnapshot, setDashboardSnapshot] = useState(snapshot);

  useEffect(() => {
    if (!enableLiveRuntime) {
      return undefined;
    }

    const runtime = new NyxRuntime();
    const eventTypes: string[] = [];
    let mounted = true;

    const refresh = () => {
      if (mounted) {
        setDashboardSnapshot(createDashboardSnapshotFromRuntime(runtime, eventTypes));
      }
    };

    const unsubscribers = observedEvents.map((eventName) =>
      runtime.getEventBus().on(eventName, () => {
        eventTypes.unshift(eventName);
        refresh();
      })
    );
    const interval = window.setInterval(refresh, 1000);

    void runtime
      .start()
      .then(refresh)
      .catch(() => {
        eventTypes.unshift("runtime.failed");
        refresh();
      });

    return () => {
      mounted = false;
      window.clearInterval(interval);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      void runtime.stop();
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
            <PluginList overview={dashboardSnapshot.overview} plugins={dashboardSnapshot.plugins} />
            <EventList overview={dashboardSnapshot.overview} events={dashboardSnapshot.recentEvents} />
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
