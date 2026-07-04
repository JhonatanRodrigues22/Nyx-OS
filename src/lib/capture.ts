import type { FinanceEntryType, Priority } from "@/types";

export type CaptureKind = "task" | "note" | "finance" | "decision";

export type CapturePayload =
  | {
      kind: "task";
      title: string;
      description?: string;
      priority?: Priority;
      date_due?: string;
      project_id?: string;
    }
  | {
      kind: "note";
      content: string;
    }
  | {
      kind: "finance";
      type: FinanceEntryType;
      category: string;
      description?: string;
      amount: number;
      date: string;
      project_id?: string;
    }
  | {
      kind: "decision";
      description: string;
      date: string;
    };

export type CaptureResult = {
  table: string;
  data: Record<string, unknown>;
};

type InsertableSupabaseClient = {
  from: (table: string) => {
    insert: (data: Record<string, unknown>) => PromiseLike<{ error: Error | null }>;
  };
};

const kindToTable: Record<CaptureKind, string> = {
  task: "tasks",
  note: "notes",
  finance: "finance_entries",
  decision: "decisions"
};

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown): string | null {
  const text = asText(value);
  return text.length > 0 ? text : null;
}

function isPriority(value: unknown): value is Priority {
  return value === "low" || value === "medium" || value === "high";
}

function isFinanceEntryType(value: unknown): value is FinanceEntryType {
  return value === "income" || value === "expense";
}

export function parseCapturePayload(body: unknown): CapturePayload {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body.");
  }

  const input = body as Record<string, unknown>;

  switch (input.kind) {
    case "task": {
      const title = asText(input.title);
      if (!title) {
        throw new Error("Task title is required.");
      }

      const priority = input.priority === undefined || input.priority === "" ? "medium" : input.priority;
      if (!isPriority(priority)) {
        throw new Error("Task priority is invalid.");
      }

      return {
        kind: "task",
        title,
        description: optionalText(input.description) ?? undefined,
        priority,
        date_due: optionalText(input.date_due) ?? undefined,
        project_id: optionalText(input.project_id) ?? undefined
      };
    }
    case "note": {
      const content = asText(input.content);
      if (!content) {
        throw new Error("Note content is required.");
      }

      return {
        kind: "note",
        content
      };
    }
    case "finance": {
      if (!isFinanceEntryType(input.type)) {
        throw new Error("Finance entry type is invalid.");
      }

      const category = asText(input.category);
      const date = asText(input.date);
      const amount = Number(input.amount);

      if (!category) {
        throw new Error("Finance category is required.");
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Finance amount must be greater than zero.");
      }

      if (!date) {
        throw new Error("Finance date is required.");
      }

      return {
        kind: "finance",
        type: input.type,
        category,
        description: optionalText(input.description) ?? undefined,
        amount,
        date,
        project_id: optionalText(input.project_id) ?? undefined
      };
    }
    case "decision": {
      const description = asText(input.description);
      const date = asText(input.date);

      if (!description) {
        throw new Error("Decision description is required.");
      }

      if (!date) {
        throw new Error("Decision date is required.");
      }

      return {
        kind: "decision",
        description,
        date
      };
    }
    default:
      throw new Error("Capture kind is invalid.");
  }
}

export async function insertCaptureItem(
  client: InsertableSupabaseClient,
  payload: CapturePayload
): Promise<CaptureResult> {
  const table = kindToTable[payload.kind];
  const data = Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => key !== "kind" && value !== undefined)
  );

  const { error } = await client.from(table).insert(data);

  if (error) {
    throw error;
  }

  return {
    table,
    data
  };
}
