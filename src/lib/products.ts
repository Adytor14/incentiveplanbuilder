// Shared product catalog — the same set of products is visible for every
// user role (TMs, RMs and AMs).

export type ProductRef = { id: string; name: string; factor: number };

export const PRODUCTS: ProductRef[] = [
  { id: "prod-a", name: "Product A — Onclera", factor: 1 },
  { id: "prod-b", name: "Product B — Velorin", factor: 0.82 },
  { id: "prod-c", name: "Product C — Aurelix", factor: 1.15 },
];

export const DEFAULT_PRODUCT_ID = PRODUCTS[0].id;
