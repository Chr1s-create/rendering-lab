export const API = process.env.MOCK_API_URL ?? "http://localhost:4000";

export type TimeResp = { hit: number; key: string; servedAt: string; seq: number; random: string };
export type Product = { id: string; name: string; price: number };

export async function fetchTime(tag: string): Promise<TimeResp> {
  const r = await fetch(`${API}/time?tag=${tag}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`mock-api /time ${r.status}`);
  return r.json() as Promise<TimeResp>;
}

export async function fetchProducts(): Promise<{ products: Product[]; servedAt: string; hit: number }> {
  const r = await fetch(`${API}/products?tag=legacy-ssg`, { cache: "no-store" });
  if (!r.ok) throw new Error(`mock-api /products ${r.status}`);
  return r.json();
}
