import type { DashboardCard } from "@nyx-os/core";

type DashboardCardGridProps = {
  cards: DashboardCard[];
};

export function DashboardCardGrid({ cards }: DashboardCardGridProps) {
  return (
    <section className="card-grid" aria-label="Resumo operacional">
      {cards.map((card) => (
        <article className="metric-card" key={card.title}>
          <div className="card-heading">
            <h2>{card.title}</h2>
            <span className={`badge ${card.status}`}>{card.status}</span>
          </div>
          <strong>{card.value}</strong>
          <p>{card.description}</p>
        </article>
      ))}
    </section>
  );
}
