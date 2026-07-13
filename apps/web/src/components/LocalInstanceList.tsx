import type { DashboardSnapshot } from "@nyx-os/core";

type LocalInstanceListProps = {
  localGateway: DashboardSnapshot["localGateway"];
};

function heartbeatLabel(timestamp: string): string {
  return timestamp.replace("T", " ").replace("Z", " UTC");
}

export function LocalInstanceList({ localGateway }: LocalInstanceListProps) {
  const connected = localGateway.instances.filter((instance) => instance.status === "connected").length;

  return (
    <section className="panel" aria-label="Instâncias Nyx Local">
      <div className="section-heading">
        <div>
          <p className="panel-kicker">Local Communication</p>
          <h2>Nyx Local</h2>
        </div>
        <span className={`badge ${connected > 0 ? "ready" : "planned"}`}>
          {connected}/{localGateway.instances.length}
        </span>
      </div>
      <ul className="local-instance-list">
        {localGateway.instances.length === 0 ? (
          <li className="empty-row">Nenhuma instância local conectada.</li>
        ) : (
          localGateway.instances.map((instance) => (
            <li key={instance.id}>
              <div className="local-instance-heading">
                <div>
                  <strong>{instance.id}</strong>
                  <p>
                    {instance.platform} · v{instance.version}
                  </p>
                </div>
                <span className={`status-indicator ${instance.status === "connected" ? "ready" : instance.status === "stale" ? "planned" : "offline"}`}>
                  {instance.status}
                </span>
              </div>
              <p className="local-heartbeat">
                Último heartbeat: <time dateTime={instance.lastHeartbeatAt}>{heartbeatLabel(instance.lastHeartbeatAt)}</time>
              </p>
              <div className="local-capabilities" aria-label={`Capabilities de ${instance.id}`}>
                {instance.capabilities.length === 0 ? (
                  <span className="local-capability empty">sem capabilities anunciadas</span>
                ) : (
                  instance.capabilities.map((capability) => (
                    <span className="local-capability" key={capability.id}>
                      {capability.id}
                    </span>
                  ))
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
