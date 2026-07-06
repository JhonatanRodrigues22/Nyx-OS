import type { DashboardCard } from "@nyx-os/core";

type DashboardCardGridProps = {
  cards: DashboardCard[];
};

const cardKinds: Record<string, string> = {
  Runtime: "runtime",
  Servicos: "services",
  Infraestrutura: "infra",
  Plugins: "plugins",
  Scheduler: "scheduler",
  Capabilities: "capabilities",
  Tools: "tools"
};

export function DashboardCardGrid({ cards }: DashboardCardGridProps) {
  return (
    <section className="card-grid" aria-label="Resumo operacional">
      {cards.map((card) => (
        <article className={`metric-card ${cardKinds[card.title] ?? "generic"}`} key={card.title}>
          <div className="card-heading">
            <h2>{card.title}</h2>
            <span className={`badge ${card.status}`}>{card.status}</span>
          </div>
          <span className="metric-glyph" aria-hidden="true" />
          <strong>{card.value}</strong>
          <p>{card.description}</p>
          <span className="metric-pulse-line" aria-hidden="true" />
        </article>
      ))}
    </section>
  );
}
