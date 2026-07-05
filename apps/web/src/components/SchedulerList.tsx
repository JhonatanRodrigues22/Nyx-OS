import type { DashboardOverview } from "@nyx-os/core";
import type { ScheduledTaskSnapshot } from "@nyx-os/scheduler";

type SchedulerListProps = {
  overview: DashboardOverview;
  tasks: ScheduledTaskSnapshot[];
};

export function SchedulerList({ overview, tasks }: SchedulerListProps) {
  return (
    <section className="panel" aria-label="Scheduler">
      <div className="section-heading">
        <div>
          <p className="panel-kicker">Execucao recorrente</p>
          <h2>Scheduler</h2>
        </div>
        <span className={`badge ${overview.scheduler.status === "running" ? "ready" : "planned"}`}>
          {overview.scheduler.status}
        </span>
      </div>

      <dl className="mini-stats">
        <div>
          <dt>Tasks Registradas</dt>
          <dd>{overview.scheduler.taskCount}</dd>
        </div>
        <div>
          <dt>Ativas</dt>
          <dd>{overview.scheduler.activeTasks}</dd>
        </div>
        <div>
          <dt>Ultimo Heartbeat</dt>
          <dd>{overview.scheduler.lastHeartbeatLabel}</dd>
        </div>
      </dl>

      <ul className="scheduler-list">
        {tasks.length === 0 ? (
          <li className="empty-row">Nenhuma task registrada ainda.</li>
        ) : (
          tasks.map((task) => (
            <li key={task.id}>
              <div>
                <strong>{task.name}</strong>
                <p>{task.id}</p>
              </div>
              <span className={`status-indicator ${task.status === "scheduled" ? "ready" : "planned"}`}>
                {task.status}
              </span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
