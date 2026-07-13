import type { FinanceEntry, FinanceEntryType, PersonalDataRepository } from "./PersonalDataTypes";
import { requireIsoDateLike, requireNonEmpty } from "./validation";

const FINANCE_ENTRY_TYPES = new Set<FinanceEntryType>(["income", "expense"]);

export class FinanceRepository implements PersonalDataRepository<FinanceEntry> {
  constructor(private readonly repository: PersonalDataRepository<FinanceEntry>) {}

  async create(record: FinanceEntry): Promise<FinanceEntry> {
    this.validate(record);

    return this.repository.create(record);
  }

  async list(): Promise<FinanceEntry[]> {
    return this.repository.list();
  }

  async get(id: string): Promise<FinanceEntry | null> {
    return this.repository.get(id);
  }

  async update(id: string, changes: Partial<Omit<FinanceEntry, "id">>): Promise<FinanceEntry> {
    const current = await this.requireExisting(id);
    const next = { ...current, ...changes, id };

    this.validate(next);

    return this.repository.update(id, changes);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  private async requireExisting(id: string): Promise<FinanceEntry> {
    const entry = await this.repository.get(id);

    if (!entry) {
      throw new Error(`Finance entry not found: ${id}`);
    }

    return entry;
  }

  private validate(entry: FinanceEntry): void {
    requireNonEmpty(entry.id, "Finance entry id");
    requireNonEmpty(entry.description, "Finance entry description");
    requireIsoDateLike(entry.date, "Finance entry date");

    if (entry.amount < 0) {
      throw new Error("Finance entry amount must not be negative.");
    }

    if (!FINANCE_ENTRY_TYPES.has(entry.type)) {
      throw new Error(`Finance entry type is invalid: ${entry.type}`);
    }
  }
}
