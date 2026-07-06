import type { CapabilitySnapshot } from "@nyx-os/capabilities";
import type { DashboardOverview } from "@nyx-os/core";

type CapabilityListProps = {
  overview: DashboardOverview;
  capabilities: CapabilitySnapshot[];
};

export function CapabilityList({ overview, capabilities }: CapabilityListProps) {
  return (
    <section className="panel" aria-label="Capabilities registradas">
      <div className="section-heading">
        <div>
          <p className="panel-kicker">Capacidades do sistema</p>
          <h2>Capabilities</h2>
        </div>
        <span className="badge ready">
          {overview.capabilities.enabled}/{overview.capabilities.total}
        </span>
      </div>
      <ul className="plugin-list">
        {capabilities.length === 0 ? (
          <li className="empty-row">Nenhuma capability registrada.</li>
        ) : (
          capabilities.map((capability) => (
            <li key={capability.id}>
              <span className="plugin-node" aria-hidden="true" />
              <div>
                <strong>{capability.name}</strong>
                <p>{capability.id}</p>
              </div>
              <span className={`status-indicator ${capability.enabled ? "ready" : "planned"}`}>
                {capability.enabled ? "enabled" : "disabled"}
              </span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
