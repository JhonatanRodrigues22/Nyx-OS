import type { PersonalDataRepository } from "./PersonalDataTypes";

export class InMemoryRepository<T extends { id: string }> implements PersonalDataRepository<T> {
  private readonly records = new Map<string, T>();

  async create(record: T): Promise<T> {
    if (this.records.has(record.id)) {
      throw new Error(`Record already exists: ${record.id}`);
    }

    this.records.set(record.id, this.clone(record));

    return this.clone(record);
  }

  async list(): Promise<T[]> {
    return Array.from(this.records.values()).map((record) => this.clone(record));
  }

  async get(id: string): Promise<T | null> {
    const record = this.records.get(id);

    return record ? this.clone(record) : null;
  }

  async update(id: string, changes: Partial<Omit<T, "id">>): Promise<T> {
    const current = this.records.get(id);

    if (!current) {
      throw new Error(`Record not found: ${id}`);
    }

    const next = { ...current, ...changes, id } as T;
    this.records.set(id, this.clone(next));

    return this.clone(next);
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  private clone(record: T): T {
    return { ...record };
  }
}
