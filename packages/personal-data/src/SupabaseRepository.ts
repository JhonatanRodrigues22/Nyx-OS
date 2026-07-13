import type { PersonalDataRepository } from "./PersonalDataTypes";

type SupabaseError = {
  message: string;
};

type SupabaseResult<T> = {
  data: T;
  error: SupabaseError | null;
};

type SupabaseSingleSelect<T> = {
  single(): Promise<SupabaseResult<T>>;
};

type SupabaseMaybeSingleSelect<T> = {
  maybeSingle(): Promise<SupabaseResult<T | null>>;
};

type SupabaseTable<T extends { id: string }> = {
  insert(record: T): { select(columns: string): SupabaseSingleSelect<T> };
  select(columns: string): {
    eq(column: string, value: string): SupabaseMaybeSingleSelect<T>;
    order(column: string, options: { ascending: boolean }): Promise<SupabaseResult<T[]>>;
  };
  update(changes: Partial<Omit<T, "id">>): {
    eq(column: string, value: string): { select(columns: string): SupabaseSingleSelect<T> };
  };
  delete(): { eq(column: string, value: string): Promise<SupabaseResult<null>> };
};

export type SupabaseRepositoryClient<T extends { id: string }> = {
  from(tableName: string): SupabaseTable<T>;
};

export type SupabaseRepositoryOptions<T extends { id: string }> = {
  client: SupabaseRepositoryClient<T>;
  tableName: string;
};

export class SupabaseRepository<T extends { id: string }> implements PersonalDataRepository<T> {
  private readonly client: SupabaseRepositoryClient<T>;
  private readonly tableName: string;

  constructor(options: SupabaseRepositoryOptions<T>) {
    this.client = options.client;
    this.tableName = options.tableName;
  }

  async create(record: T): Promise<T> {
    const result = await this.client.from(this.tableName).insert(record).select("*").single();

    return this.unwrap(result);
  }

  async list(): Promise<T[]> {
    const result = await this.client.from(this.tableName).select("*").order("id", { ascending: true });

    return this.unwrap(result);
  }

  async get(id: string): Promise<T | null> {
    const result = await this.client.from(this.tableName).select("*").eq("id", id).maybeSingle();

    return this.unwrap(result);
  }

  async update(id: string, changes: Partial<Omit<T, "id">>): Promise<T> {
    const result = await this.client.from(this.tableName).update(changes).eq("id", id).select("*").single();

    return this.unwrap(result);
  }

  async delete(id: string): Promise<void> {
    const result = await this.client.from(this.tableName).delete().eq("id", id);

    this.unwrap(result);
  }

  private unwrap<R>(result: SupabaseResult<R>): R {
    if (result.error) {
      throw new Error(`Supabase repository operation failed for ${this.tableName}: ${result.error.message}`);
    }

    return result.data;
  }
}
