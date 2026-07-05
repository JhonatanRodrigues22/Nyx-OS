import type { DashboardOverview, RuntimeState } from "@nyx-os/core";
import type { CSSProperties } from "react";

type InfrastructurePanelProps = {
  overview: DashboardOverview;
  modules: RuntimeState["modules"];
};

export function InfrastructurePanel({ overview, modules }: InfrastructurePanelProps) {
  const readyModules = modules.filter((module) => module.status === "ready").length;
  const healthStyle = { "--value": `${overview.healthScore}%` } as CSSProperties;
  const infrastructureStyle = { "--fill": `${overview.infrastructureScore}%` } as CSSProperties;
  const serviceStyle = {
    "--fill": `${overview.services.total > 0 ? (overview.services.running / overview.services.total) * 100 : 0}%`
  } as CSSProperties;
  const pluginStyle = {
    "--fill": `${overview.plugins.total > 0 ? (overview.plugins.initialized / overview.plugins.total) * 100 : 0}%`
  } as CSSProperties;
  const schedulerStyle = {
    "--fill": overview.scheduler.status === "running" ? "100%" : overview.scheduler.status === "paused" ? "60%" : "40%"
  } as CSSProperties;

  return (
    <section className="panel infrastructure-panel" aria-labelledby="infrastructure-title">
      <div className="section-heading">
        <div>
          <p className="panel-kicker">Leitura rapida</p>
          <h2 id="infrastructure-title">Saude do Sistema</h2>
        </div>
        <span className="badge ready">{overview.healthScore}%</span>
      </div>

      <div className="system-health-layout">
        <div className="health-gauge" style={healthStyle}>
          <div className="gauge-core">
            <strong>{overview.healthScore}%</strong>
            <span>Saude geral</span>
          </div>
        </div>
        <div className="progress-stack">
          <div className="metric-bar" style={serviceStyle}>
            <div className="health-row">
              <span>Servicos</span>
              <strong>
                {overview.services.running}/{overview.services.total}
              </strong>
            </div>
            <div className="progress-track">
              <span />
            </div>
          </div>
          <div className="metric-bar" style={infrastructureStyle}>
            <div className="health-row">
              <span>Infraestrutura</span>
              <strong>{overview.infrastructureScore}%</strong>
            </div>
            <div className="progress-track">
              <span />
            </div>
          </div>
          <div className="metric-bar" style={pluginStyle}>
            <div className="health-row">
              <span>Plugins</span>
              <strong>
                {overview.plugins.initialized}/{overview.plugins.total}
              </strong>
            </div>
            <div className="progress-track">
              <span />
            </div>
          </div>
          <div className="metric-bar" style={schedulerStyle}>
            <div className="health-row">
              <span>Scheduler</span>
              <strong>{overview.scheduler.status}</strong>
            </div>
            <div className="progress-track">
              <span />
            </div>
          </div>
        </div>
      </div>

      <div className="quick-vision" aria-label="Visao rapida">
        <article>
          <span>Servicos ativos</span>
          <strong>
            {overview.services.running}/{overview.services.total}
          </strong>
          <i className="spark spark-a" />
        </article>
        <article>
          <span>Plugins carregados</span>
          <strong>
            {overview.plugins.initialized}/{overview.plugins.total}
          </strong>
          <i className="bars-mini" />
        </article>
        <article>
          <span>Eventos recentes</span>
          <strong>{overview.events.recent}</strong>
          <i className="spark spark-b" />
        </article>
        <article>
          <span>Modulos prontos</span>
          <strong>
            {readyModules}/{modules.length}
          </strong>
          <i className="ring-mini" />
        </article>
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
