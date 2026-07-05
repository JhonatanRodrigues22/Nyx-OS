import type { DashboardOverview, RuntimeState } from "@nyx-os/core";

type InfrastructurePanelProps = {
  overview: DashboardOverview;
  modules: RuntimeState["modules"];
};

export function InfrastructurePanel({ overview, modules }: InfrastructurePanelProps) {
  const readyModules = modules.filter((module) => module.status === "ready").length;

  return (
    <section className="panel infrastructure-panel" aria-labelledby="infrastructure-title">
      <div className="section-heading">
        <div>
          <p className="panel-kicker">Leitura rapida</p>
          <h2 id="infrastructure-title">Saude do Sistema</h2>
        </div>
        <span className="badge ready">{overview.healthScore}%</span>
      </div>

      <div className="dashboard-console" aria-label="Resumo do sistema">
        <div className="console-row">
          <span>Status</span>
          <strong>{overview.statusLabel}</strong>
        </div>
        <div className="console-row">
          <span>Versao</span>
          <strong>v{overview.version}</strong>
        </div>
        <div className="console-row">
          <span>Ambiente</span>
          <strong>{overview.environment}</strong>
        </div>
        <div className="console-row">
          <span>Runtime</span>
          <strong>{overview.runtimeStatus}</strong>
        </div>
        <div className="console-row">
          <span>Tempo Online</span>
          <strong>{overview.uptimeLabel}</strong>
        </div>
      </div>

      <div className="progress-stack">
        <div>
          <div className="health-row">
            <span>Saude geral</span>
            <strong>{overview.healthScore}%</strong>
          </div>
          <div className="progress-line">{overview.healthBar}</div>
        </div>
        <div>
          <div className="health-row">
            <span>Infraestrutura</span>
            <strong>{overview.infrastructureScore}%</strong>
          </div>
          <div className="progress-line">{overview.infrastructureBar}</div>
        </div>
      </div>

      <dl className="signal-grid">
        <div>
          <dt>Servicos ativos</dt>
          <dd>
            {overview.services.running}/{overview.services.total}
          </dd>
        </div>
        <div>
          <dt>Plugins carregados</dt>
          <dd>
            {overview.plugins.initialized}/{overview.plugins.total}
          </dd>
        </div>
        <div>
          <dt>Scheduler</dt>
          <dd>{overview.scheduler.status}</dd>
        </div>
        <div>
          <dt>Tasks registradas</dt>
          <dd>{overview.scheduler.taskCount}</dd>
        </div>
        <div>
          <dt>Eventos recentes</dt>
          <dd>{overview.events.recent}</dd>
        </div>
        <div>
          <dt>Modulos prontos</dt>
          <dd>
            {readyModules}/{modules.length}
          </dd>
        </div>
      </dl>
    </section>
  );
}
