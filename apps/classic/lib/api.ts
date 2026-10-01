import "server-only";

// Server-side data helpers. `server-only` makes importing this from a Client Component a BUILD error,
// which is how you keep secrets / internal URLs out of the browser bundle.
export const API = process.env.MOCK_API_URL ?? "http://localhost:4000";

export type Meta = { hit: number; key: string; servedAt: string; seq: number };
export type TimeResp = Meta & { random: string };
export type Post = { slug: string; title: string; body: string };
export type Product = { id: string; name: string; price: number };
export type Todo = { id: number; text: string; done: boolean };

type NextFetchInit = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } };

async function get<T>(path: string, init?: NextFetchInit): Promise<T> {
  const r = await fetch(`${API}${path}`, init);
  if (!r.ok) throw new Error(`mock-api ${path} -> ${r.status}`);
  return r.json() as Promise<T>;
}

export const getTime = (tag: string, init?: NextFetchInit, delay = 0) =>
  get<TimeResp>(`/time?tag=${tag}${delay ? `&delay=${delay}` : ""}`, init);

export const getPosts = (init?: NextFetchInit) => get<Meta & { posts: Post[] }>("/posts", init);
export const getPost = (slug: string, init?: NextFetchInit) =>
  fetch(`${API}/posts/${slug}`, init).then(async (r) =>
    r.status === 404 ? null : ((await r.json()) as Meta & { post: Post }),
  );
export const getProducts = (init?: NextFetchInit) => get<Meta & { products: Product[] }>("/products", init);
export const getTodos = (init?: NextFetchInit) => get<Meta & { todos: Todo[] }>("/todos", init);
