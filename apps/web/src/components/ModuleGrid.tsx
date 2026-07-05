import type { RuntimeState } from "@nyx-os/core";

type ModuleGridProps = {
  modules: RuntimeState["modules"];
};

export function ModuleGrid({ modules }: ModuleGridProps) {
  return (
    <section className="panel" aria-labelledby="modules-title">
      <div className="section-heading">
        <h2 id="modules-title">Módulos</h2>
        <span className="badge mocked">planned</span>
      </div>
      <div className="module-grid">
        {modules.map((module) => (
          <article className="module-card" key={module.id}>
            <div>
              <h3>{module.label}</h3>
              <p>{module.description}</p>
            </div>
            <span className={`status-indicator ${module.status}`}>{module.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
