import type { DashboardOverview } from "@nyx-os/core";
import type { NyxPluginSnapshot } from "@nyx-os/plugin";

type PluginListProps = {
  overview: DashboardOverview;
  plugins: NyxPluginSnapshot[];
};

export function PluginList({ overview, plugins }: PluginListProps) {
  return (
    <section className="panel" aria-label="Plugins registrados">
      <div className="section-heading">
        <div>
          <p className="panel-kicker">Extensibilidade</p>
          <h2>Plugins</h2>
        </div>
        <span className="badge ready">
          {overview.plugins.initialized}/{overview.plugins.total}
        </span>
      </div>
      <ul className="plugin-list">
        {plugins.length === 0 ? (
          <li className="empty-row">Nenhum plugin carregado.</li>
        ) : (
          plugins.map((plugin) => (
            <li key={plugin.id}>
              <div>
                <strong>{plugin.name}</strong>
                <p>{plugin.id}</p>
              </div>
              <span className={`status-indicator ${plugin.status === "initialized" ? "ready" : "planned"}`}>
                {plugin.status}
              </span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
