import type { NyxPluginSnapshot } from "@nyx-os/plugin";

type PluginListProps = {
  plugins: NyxPluginSnapshot[];
};

export function PluginList({ plugins }: PluginListProps) {
  return (
    <section className="panel" aria-label="Plugins registrados">
      <div className="section-heading">
        <h2>Plugins</h2>
        <span className="badge ready">{plugins.length}</span>
      </div>
      <ul className="plugin-list">
        {plugins.map((plugin) => (
          <li key={plugin.id}>
            <div>
              <strong>{plugin.name}</strong>
              <p>{plugin.id}</p>
            </div>
            <span className={`status-indicator ${plugin.status === "initialized" ? "ready" : "planned"}`}>
              {plugin.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
