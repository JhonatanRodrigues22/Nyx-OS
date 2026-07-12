import type { DashboardOverview } from "@nyx-os/core";
import type { ToolSnapshot } from "@nyx-os/tools";

type ToolListProps = {
  overview: DashboardOverview;
  tools: ToolSnapshot[];
};

export function ToolList({ overview, tools }: ToolListProps) {
  return (
    <section className="panel" aria-label="Tools registradas">
      <div className="section-heading">
        <div>
          <p className="panel-kicker">API executavel</p>
          <h2>Tools</h2>
        </div>
        <span className="badge ready">
          {overview.tools.enabled}/{overview.tools.total}
        </span>
      </div>
      <ul className="plugin-list">
        {tools.length === 0 ? (
          <li className="empty-row">Nenhuma tool registrada.</li>
        ) : (
          tools.map((tool) => (
            <li key={tool.id}>
              <span className="plugin-node" aria-hidden="true" />
              <div>
                <strong>{tool.name}</strong>
                <p>
                  {tool.id}
                  {tool.lastExecutedAt ? ` · ${tool.lastExecutedAt}` : ""}
                </p>
              </div>
              <span className={`status-indicator ${tool.enabled ? "ready" : "planned"}`}>
                {tool.enabled ? "enabled" : "disabled"}
              </span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
