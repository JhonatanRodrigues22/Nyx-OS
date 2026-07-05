import type { DashboardOverview, SystemStatus } from "@nyx-os/core";

type StatusPanelProps = {
  overview: DashboardOverview;
  status: SystemStatus;
};

export function StatusPanel({ overview, status }: StatusPanelProps) {
  return (
    <aside className="status-panel" aria-label="Estado Atual">
      <div className={`pulse ${status.health}`} aria-hidden="true" />
      <div className="status-panel-content">
        <div className="status-header">
          <span>Estado Atual</span>
          <strong>{overview.statusLabel}</strong>
        </div>
        <dl className="status-metrics">
          <div>
            <dt>Versao</dt>
            <dd>v{overview.version}</dd>
          </div>
          <div>
            <dt>Ambiente</dt>
            <dd>{overview.environment}</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>{overview.runtimeStatus}</dd>
          </div>
          <div>
            <dt>Tempo Online</dt>
            <dd>{overview.uptimeLabel}</dd>
          </div>
        </dl>
        <div className="health-row" aria-label="Saude do Sistema">
          <span>Saude do Sistema</span>
          <strong>{overview.healthScore}%</strong>
        </div>
        <div className="progress-line" aria-hidden="true">
          {overview.healthBar}
        </div>
      </div>
    </aside>
  );
}
