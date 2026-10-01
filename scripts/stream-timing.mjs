// Prints when each HTTP chunk of a streamed response arrives and which data-marker values it contains.
// Usage: node scripts/stream-timing.mjs /streaming [baseUrl]
const path = process.argv[2] ?? "/streaming";
const base = process.argv[3] ?? "http://localhost:3000";

const t0 = Date.now();
const res = await fetch(base + path, { cache: "no-store" });
console.log(`status ${res.status}  headers at +${Date.now() - t0}ms  transfer-encoding=${res.headers.get("transfer-encoding")}`);

const decoder = new TextDecoder();
let i = 0;
let total = 0;
const seen = new Set();
const results = [];
for await (const chunk of res.body) {
  const text = decoder.decode(chunk, { stream: true });
  total += text.length;
  const markers = [...text.matchAll(/data-marker="([^"]+)"/g)].map((m) => m[1]).filter((m) => !seen.has(m));
  markers.forEach((m) => seen.add(m));
  const fallbacks = [...text.matchAll(/data-fallback="([^"]+)"/g)].map((m) => m[1]);
  const at = Date.now() - t0;
  results.push({ at, markers });
  console.log(
    `chunk ${String(++i).padStart(2)}  +${String(at).padStart(5)}ms  ${String(text.length).padStart(6)} bytes` +
      (markers.length ? `  markers: ${markers.join(", ")}` : "") +
      (fallbacks.length ? `  fallbacks: ${fallbacks.join(", ")}` : ""),
  );
}
console.log(`done in ${Date.now() - t0}ms, ${total} chars`);

if (process.env.JSON_OUT) console.log(JSON.stringify(results));
