import { createServer } from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 4000);
const startedAt = new Date().toISOString();

const posts = [
  {
    slug: "hello-ssg",
    title: "Hello SSG",
    body: "This post is returned by generateStaticParams, so its HTML exists before anyone visits.",
  },
  {
    slug: "why-isr",
    title: "Why ISR exists",
    body: "ISR keeps the static speed of SSG while letting the HTML refresh after a revalidate window.",
  },
  {
    slug: "ssr-tradeoffs",
    title: "SSR tradeoffs",
    body: "Not listed in generateStaticParams. With dynamicParams=true the first request renders it, later ones are cached.",
  },
];

const products = [
  { id: "p1", name: "Cache Key", price: 12 },
  { id: "p2", name: "Suspense Boundary", price: 4 },
  { id: "p3", name: "Server Action", price: 9 },
];

let todos = [
  { id: 1, text: "Read the Notes tab", done: true },
  { id: 2, text: "Run a verify script in production mode", done: false },
];
let nextTodoId = 3;
let seq = 0;
const hits = new Map();

function bump(key) {
  hits.set(key, (hits.get(key) || 0) + 1);
  return hits.get(key);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function json(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function meta(key) {
  seq += 1;
  return {
    hit: bump(key),
    key,
    servedAt: new Date().toISOString(),
    seq,
  };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);

  if (req.method === "OPTIONS") {
    json(res, 204, {});
    return;
  }

  try {
    if (url.pathname === "/__stats") {
      json(res, 200, { startedAt, hits: Object.fromEntries(hits), pid: process.pid, now: new Date().toISOString() });
      return;
    }

    if (url.pathname === "/__reset" && req.method === "POST") {
      hits.clear();
      todos = [
        { id: 1, text: "Read the Notes tab", done: true },
        { id: 2, text: "Run a verify script in production mode", done: false },
      ];
      nextTodoId = 3;
      json(res, 200, { ok: true });
      return;
    }

    if (url.pathname === "/health") {
      json(res, 200, { ok: true });
      return;
    }

    if (url.pathname === "/time") {
      const delay = Number(url.searchParams.get("delay") || 0);
      if (delay) await sleep(delay);
      const key = `/time?${url.searchParams.toString()}`;
      json(res, 200, { ...meta(key), random: crypto.randomUUID() });
      return;
    }

    if (url.pathname === "/posts") {
      const delay = Number(url.searchParams.get("delay") || 0);
      if (delay) await sleep(delay);
      json(res, 200, { ...meta("/posts"), posts });
      return;
    }

    const postMatch = url.pathname.match(/^\/posts\/([^/]+)$/);
    if (postMatch) {
      const slug = postMatch[1];
      const key = `/posts/${slug}`;
      const delay = Number(url.searchParams.get("delay") || 0);
      if (delay) await sleep(delay);
      const post = posts.find((item) => item.slug === slug);
      if (!post) {
        json(res, 404, { ...meta(key), error: "not_found", slug });
        return;
      }
      json(res, 200, { ...meta(key), post });
      return;
    }

    if (url.pathname === "/products") {
      const delay = Number(url.searchParams.get("delay") || 0);
      if (delay) await sleep(delay);
      const tag = url.searchParams.get("tag");
      const key = tag ? `/products?tag=${tag}` : "/products";
      json(res, 200, { ...meta(key), products });
      return;
    }

    if (url.pathname === "/todos") {
      if (req.method === "POST") {
        if (url.searchParams.get("fail") === "1") {
          json(res, 500, { ...meta("/todos:create"), error: "simulated failure" });
          return;
        }
        const body = await readBody(req);
        const text = String(body.text || "").trim();
        const todo = { id: nextTodoId++, text: text || "Untitled", done: false };
        todos = [...todos, todo];
        json(res, 201, { ...meta("/todos:create"), todo });
        return;
      }
      json(res, 200, { ...meta("/todos"), todos });
      return;
    }

    const slowMatch = url.pathname.match(/^\/slow\/(\d+)$/);
    if (slowMatch) {
      const ms = Number(slowMatch[1]);
      await sleep(ms);
      json(res, 200, { ...meta(`/slow/${ms}`), waitedMs: ms });
      return;
    }

    json(res, 404, { error: "unknown_route", path: url.pathname });
  } catch (error) {
    json(res, 500, { error: String(error) });
  }
});

server.listen(PORT, () => {
  console.log(`[mock-api] listening on http://localhost:${PORT}`);
});
