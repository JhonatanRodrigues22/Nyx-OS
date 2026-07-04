export type EntityId = string;
export type ISODate = string;
export type ISODateTime = string;

export type TaskStatus = "inbox" | "todo" | "doing" | "done" | "archived";
export type ProjectStatus = "active" | "paused" | "completed" | "archived";
export type Priority = "low" | "medium" | "high";
export type HabitFrequency = "daily" | "weekly" | "monthly" | "custom";
export type FinanceEntryType = "income" | "expense";

export interface Tag {
  id: EntityId;
  user_id: EntityId;
  name: string;
  created_at?: ISODateTime;
}

export interface Task {
  id: EntityId;
  user_id: EntityId;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority?: Priority | null;
  date_due?: ISODate | null;
  project_id?: EntityId | null;
  tags?: string[];
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface Project {
  id: EntityId;
  user_id: EntityId;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  next_action?: string | null;
  tags?: string[];
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface Habit {
  id: EntityId;
  user_id: EntityId;
  title: string;
  frequency: HabitFrequency;
  attribute?: string | null;
  color?: string | null;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface HabitLog {
  id: EntityId;
  habit_id: EntityId;
  date: ISODate;
  completed: boolean;
  created_at?: ISODateTime;
}

export interface DailyCheckin {
  id: EntityId;
  user_id: EntityId;
  date: ISODate;
  mood?: number | null;
  energy?: number | null;
  body?: string | null;
  head?: string | null;
  happened?: string | null;
  done?: string | null;
  learned?: string | null;
  tomorrow?: string | null;
  decisions?: string[];
  memories?: string[];
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface FinanceEntry {
  id: EntityId;
  user_id: EntityId;
  type: FinanceEntryType;
  category: string;
  description?: string | null;
  amount: number;
  date: ISODate;
  project_id?: EntityId | null;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface Note {
  id: EntityId;
  user_id: EntityId;
  content: string;
  date: ISODate;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface Decision {
  id: EntityId;
  user_id: EntityId;
  description: string;
  date: ISODate;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface Memory {
  id: EntityId;
  user_id: EntityId;
  description: string;
  date: ISODate;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}
