import type { SystemEvent } from "@nyx-os/events";

type EventListProps = {
  events: SystemEvent[];
};

export function EventList({ events }: EventListProps) {
  return (
    <section className="panel" aria-labelledby="events-title">
      <div className="section-heading">
        <h2 id="events-title">Eventos recentes</h2>
        <span className="badge ready">in-memory</span>
      </div>
      <ol className="event-list">
        {events.map((event) => (
          <li key={event.id}>
            <span className="event-dot" />
            <div>
              <strong>{event.type}</strong>
              <p>{event.message}</p>
              <small>{event.source}</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
