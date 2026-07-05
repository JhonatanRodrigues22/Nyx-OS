import type { RuntimeState } from "@nyx-os/core";

type ModuleGridProps = {
  modules: RuntimeState["modules"];
};

export function ModuleGrid({ modules }: ModuleGridProps) {
  const readyModules = modules.filter((module) => module.status === "ready").length;

  return (
    <section className="panel" aria-labelledby="modules-title">
      <div className="section-heading">
        <div>
          <p className="panel-kicker">Fundacao tecnica</p>
          <h2 id="modules-title">Modulos</h2>
        </div>
        <span className="badge ready">
          {readyModules}/{modules.length}
        </span>
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
