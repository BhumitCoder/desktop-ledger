import { nanoid } from "nanoid";

export const genId = () => nanoid(10);

const isBrowser = typeof window !== "undefined";

export class Repository<T extends { id: string }> {
  constructor(private key: string) {}

  all(): T[] {
    if (!isBrowser) return [];
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  save(items: T[]) {
    if (!isBrowser) return;
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  get(id: string): T | undefined {
    return this.all().find((i) => i.id === id);
  }

  add(item: Omit<T, "id" | "createdAt"> & { id?: string }): T {
    const list = this.all();
    const record = {
      ...item,
      id: item.id ?? genId(),
      createdAt: new Date().toISOString(),
    } as unknown as T;
    list.unshift(record);
    this.save(list);
    return record;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const list = this.all();
    const idx = list.findIndex((i) => i.id === id);
    if (idx < 0) return undefined;
    list[idx] = { ...list[idx], ...patch };
    this.save(list);
    return list[idx];
  }

  remove(id: string) {
    this.save(this.all().filter((i) => i.id !== id));
  }

  bulkRemove(ids: string[]) {
    const set = new Set(ids);
    this.save(this.all().filter((i) => !set.has(i.id)));
  }
}
