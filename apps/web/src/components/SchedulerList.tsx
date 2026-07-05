import type { ScheduledTaskSnapshot, SchedulerStatus } from "@nyx-os/scheduler";

type SchedulerListProps = {
  status: SchedulerStatus;
  tasks: ScheduledTaskSnapshot[];
};

export function SchedulerList({ status, tasks }: SchedulerListProps) {
  return (
    <section className="panel" aria-label="Tarefas agendadas">
      <div className="section-heading">
        <h2>Scheduler</h2>
        <span className={`badge ${status === "running" ? "ready" : "planned"}`}>{status}</span>
      </div>
      <ul className="scheduler-list">
        {tasks.map((task) => (
          <li key={task.id}>
            <div>
              <strong>{task.name}</strong>
              <p>{task.id}</p>
            </div>
            <span className={`status-indicator ${task.status === "scheduled" ? "ready" : "planned"}`}>
              {task.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
