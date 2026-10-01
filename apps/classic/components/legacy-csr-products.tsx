"use client";

import { useEffect, useState } from "react";
import { ClientBadge } from "@lab/learn-ui/client";
import { PUBLIC_MOCK_API_URL } from "@lab/learn-ui/lib";

type Product = { id: string; name: string; price: number };

export function LegacyCsrProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetch(`${PUBLIC_MOCK_API_URL}/products?tag=legacy-csr`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products));
  }, []);

  return (
    <div className="space-y-2">
      <ClientBadge />
      {products ? (
        <ul data-marker="legacy-csr" className="list-disc pl-5 text-sm">
          {products.map((p) => (
            <li key={p.id}>
              {p.name}: ${p.price}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">loading…</p>
      )}
    </div>
  );
}
