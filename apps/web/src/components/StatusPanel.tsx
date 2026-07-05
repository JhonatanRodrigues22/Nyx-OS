import type { RuntimeState, SystemStatus } from "@nyx-os/core";

type StatusPanelProps = {
  status: SystemStatus;
  runtime: RuntimeState;
};

export function StatusPanel({ status, runtime }: StatusPanelProps) {
  return (
    <aside className="status-panel" aria-label="Health check">
      <span className={`pulse ${status.health}`} />
      <div>
        <p>{status.headline}</p>
        <strong>All core systems online</strong>
        <small>
          {runtime.environment} · v{runtime.version}
        </small>
      </div>
    </aside>
  );
}
