import { randomUUID } from "node:crypto";
import type { NyxCapability } from "@nyx-os/capabilities";
import type { CapabilityContext } from "@nyx-os/capabilities";
import type { NyxRuntime } from "@nyx-os/core";
import {
  InMemoryRepository,
  ProjectRepository,
  TaskRepository,
  type Project,
  type Task
} from "@nyx-os/personal-data";
import type { NyxTool } from "@nyx-os/tools";
import type { ToolContext } from "@nyx-os/tools";

export type CreateTaskInput = {
  title?: unknown;
  dueDate?: unknown;
  projectId?: unknown;
};

export type CreateProjectInput = {
  name?: unknown;
  description?: unknown;
};

export type TaskListResult = {
  total: number;
  tasks: Task[];
};

export type ProjectListResult = {
  total: number;
  projects: Project[];
};

export type CockpitPersonalDataRuntime = {
  tasks: TaskRepository;
  projects: ProjectRepository;
};

const globalForPersonalData = globalThis as typeof globalThis & {
  __nyxCockpitPersonalData?: CockpitPersonalDataRuntime;
};

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function createId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

export function getCockpitPersonalDataRuntime(): CockpitPersonalDataRuntime {
  if (!globalForPersonalData.__nyxCockpitPersonalData) {
    globalForPersonalData.__nyxCockpitPersonalData = {
      tasks: new TaskRepository(new InMemoryRepository<Task>()),
      projects: new ProjectRepository(new InMemoryRepository<Project>())
    };
  }

  return globalForPersonalData.__nyxCockpitPersonalData;
}

export function resetCockpitPersonalDataRuntimeForTests(): void {
  globalForPersonalData.__nyxCockpitPersonalData = undefined;
}

export async function createCockpitTask(input: CreateTaskInput = {}): Promise<Task> {
  const runtime = getCockpitPersonalDataRuntime();
  const title = getString(input.title);

  if (!title) {
    throw new Error("Task title is required.");
  }

  const projectId = getString(input.projectId);

  if (projectId && !(await runtime.projects.get(projectId))) {
    throw new Error(`Project not found: ${projectId}`);
  }

  return runtime.tasks.create({
    id: createId("task"),
    title,
    done: false,
    dueDate: getString(input.dueDate),
    projectId
  });
}

export async function listCockpitOpenTasks(): Promise<TaskListResult> {
  const tasks = (await getCockpitPersonalDataRuntime().tasks.list()).filter((task) => !task.done);

  return {
    total: tasks.length,
    tasks
  };
}

export async function createCockpitProject(input: CreateProjectInput = {}): Promise<Project> {
  const name = getString(input.name);

  if (!name) {
    throw new Error("Project name is required.");
  }

  return getCockpitPersonalDataRuntime().projects.create({
    id: createId("project"),
    name,
    status: "active",
    description: getString(input.description)
  });
}

export async function listCockpitActiveProjects(): Promise<ProjectListResult> {
  const projects = (await getCockpitPersonalDataRuntime().projects.list()).filter(
    (project) => project.status === "active"
  );

  return {
    total: projects.length,
    projects
  };
}

class TaskCreateCapability implements NyxCapability<CreateTaskInput, Task> {
  readonly id = "task.create";
  readonly name = "Task Create";
  readonly description = "Creates an open task in the Cockpit personal data runtime.";
  readonly version = "0.1.0";
  readonly category = "custom" as const;
  readonly tags = ["task", "cockpit", "personal-data"];
  readonly enabled = true;
  readonly metadata = {
    internal: false,
    storage: "memory"
  };

  execute(_context: CapabilityContext, input?: CreateTaskInput): Promise<Task> {
    return createCockpitTask(input);
  }
}

class TaskListOpenCapability implements NyxCapability<void, TaskListResult> {
  readonly id = "task.listOpen";
  readonly name = "Task List Open";
  readonly description = "Lists open Cockpit tasks.";
  readonly version = "0.1.0";
  readonly category = "custom" as const;
  readonly tags = ["task", "cockpit", "personal-data"];
  readonly enabled = true;
  readonly metadata = {
    internal: false,
    storage: "memory"
  };

  execute(): Promise<TaskListResult> {
    return listCockpitOpenTasks();
  }
}

class ProjectListActiveCapability implements NyxCapability<void, ProjectListResult> {
  readonly id = "project.listActive";
  readonly name = "Project List Active";
  readonly description = "Lists active Cockpit projects.";
  readonly version = "0.1.0";
  readonly category = "custom" as const;
  readonly tags = ["project", "cockpit", "personal-data"];
  readonly enabled = true;
  readonly metadata = {
    internal: false,
    storage: "memory"
  };

  execute(): Promise<ProjectListResult> {
    return listCockpitActiveProjects();
  }
}

class TaskCreateTool implements NyxTool<CreateTaskInput, Task> {
  readonly id = "task.create";
  readonly capabilityId = "task.create";
  readonly name = "Task Create";
  readonly description = "Creates an open task from Cockpit input.";
  readonly version = "0.1.0";
  readonly category = "custom" as const;
  readonly enabled = true;
  readonly parameters = {
    title: {
      type: "string" as const,
      required: true,
      description: "Task title."
    },
    dueDate: {
      type: "string" as const,
      required: false,
      description: "Optional ISO date for the task."
    },
    projectId: {
      type: "string" as const,
      required: false,
      description: "Optional active project id."
    }
  };
  readonly result = {
    description: "Created task."
  };
  readonly metadata = {
    internal: false,
    storage: "memory"
  };

  execute(_context: ToolContext, input?: CreateTaskInput): Promise<Task> {
    return createCockpitTask(input);
  }
}

class TaskListOpenTool implements NyxTool<void, TaskListResult> {
  readonly id = "task.listOpen";
  readonly capabilityId = "task.listOpen";
  readonly name = "Task List Open";
  readonly description = "Lists open tasks from the Cockpit personal data runtime.";
  readonly version = "0.1.0";
  readonly category = "custom" as const;
  readonly enabled = true;
  readonly parameters = {};
  readonly result = {
    description: "Open tasks."
  };
  readonly metadata = {
    internal: false,
    storage: "memory"
  };

  execute(): Promise<TaskListResult> {
    return listCockpitOpenTasks();
  }
}

class ProjectListActiveTool implements NyxTool<void, ProjectListResult> {
  readonly id = "project.listActive";
  readonly capabilityId = "project.listActive";
  readonly name = "Project List Active";
  readonly description = "Lists active projects from the Cockpit personal data runtime.";
  readonly version = "0.1.0";
  readonly category = "custom" as const;
  readonly enabled = true;
  readonly parameters = {};
  readonly result = {
    description: "Active projects."
  };
  readonly metadata = {
    internal: false,
    storage: "memory"
  };

  execute(): Promise<ProjectListResult> {
    return listCockpitActiveProjects();
  }
}

export function registerCockpitPersonalData(runtime: NyxRuntime): void {
  const capabilities = runtime.getCapabilities();
  const tools = runtime.getTools();

  if (!capabilities.get("task.create")) {
    capabilities.register(new TaskCreateCapability());
  }

  if (!capabilities.get("task.listOpen")) {
    capabilities.register(new TaskListOpenCapability());
  }

  if (!capabilities.get("project.listActive")) {
    capabilities.register(new ProjectListActiveCapability());
  }

  if (!tools.get("task.create")) {
    tools.register(new TaskCreateTool());
  }

  if (!tools.get("task.listOpen")) {
    tools.register(new TaskListOpenTool());
  }

  if (!tools.get("project.listActive")) {
    tools.register(new ProjectListActiveTool());
  }
}
