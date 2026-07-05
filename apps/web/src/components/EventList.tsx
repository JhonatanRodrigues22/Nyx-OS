import type { DashboardOverview } from "@nyx-os/core";
import type { SystemEvent } from "@nyx-os/events";

type EventListProps = {
  overview: DashboardOverview;
  events: SystemEvent[];
};

export function EventList({ overview, events }: EventListProps) {
  return (
    <section className="panel" aria-labelledby="events-title">
      <div className="section-heading">
        <div>
          <p className="panel-kicker">Barramento interno</p>
          <h2 id="events-title">Eventos Recentes</h2>
        </div>
        <span className="badge ready">{overview.events.recent}</span>
      </div>
      <ol className="event-list">
        {events.length === 0 ? (
          <li className="empty-row">Nenhum evento emitido ainda.</li>
        ) : (
          events.map((event, index) => (
            <li key={event.id}>
              <span className={`event-dot ${event.level}`} />
              <div>
                <strong>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {event.type}
                </strong>
                <p>{event.message}</p>
                <small>{event.source}</small>
              </div>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
