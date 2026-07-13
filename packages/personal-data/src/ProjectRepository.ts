import type { PersonalDataRepository, Project, ProjectStatus } from "./PersonalDataTypes";
import { requireNonEmpty } from "./validation";

const PROJECT_STATUSES = new Set<ProjectStatus>(["active", "paused", "completed", "archived"]);

export class ProjectRepository implements PersonalDataRepository<Project> {
  constructor(private readonly repository: PersonalDataRepository<Project>) {}

  async create(record: Project): Promise<Project> {
    this.validate(record);

    return this.repository.create(record);
  }

  async list(): Promise<Project[]> {
    return this.repository.list();
  }

  async get(id: string): Promise<Project | null> {
    return this.repository.get(id);
  }

  async update(id: string, changes: Partial<Omit<Project, "id">>): Promise<Project> {
    const current = await this.requireExisting(id);
    const next = { ...current, ...changes, id };

    this.validate(next);

    return this.repository.update(id, changes);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  private async requireExisting(id: string): Promise<Project> {
    const project = await this.repository.get(id);

    if (!project) {
      throw new Error(`Project not found: ${id}`);
    }

    return project;
  }

  private validate(project: Project): void {
    requireNonEmpty(project.id, "Project id");
    requireNonEmpty(project.name, "Project name");

    if (!PROJECT_STATUSES.has(project.status)) {
      throw new Error(`Project status is invalid: ${project.status}`);
    }
  }
}
