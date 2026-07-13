export type PersonalDataRepository<T extends { id: string }> = {
  create(record: T): Promise<T>;
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  update(id: string, changes: Partial<Omit<T, "id">>): Promise<T>;
  delete(id: string): Promise<void>;
};

export type Task = {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
  projectId?: string;
};

export type Habit = {
  id: string;
  name: string;
  frequency: string;
  createdAt: string;
};

export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  description?: string;
};

export type FinanceEntryType = "income" | "expense";

export type FinanceEntry = {
  id: string;
  description: string;
  amount: number;
  type: FinanceEntryType;
  date: string;
  category?: string;
};
