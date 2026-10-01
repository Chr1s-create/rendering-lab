import "server-only";

export const API = process.env.MOCK_API_URL ?? "http://localhost:4000";

export type Meta = { hit: number; key: string; servedAt: string; seq: number };
export type TimeResp = Meta & { random: string };
export type Todo = { id: number; text: string; done: boolean };

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, init);
  if (!r.ok) throw new Error(`mock-api ${path} -> ${r.status}`);
  return r.json() as Promise<T>;
}

export const getTime = (tag: string, delay = 0) =>
  get<TimeResp>(`/time?tag=${tag}${delay ? `&delay=${delay}` : ""}`);

export const getTodos = () => get<Meta & { todos: Todo[] }>("/todos");
