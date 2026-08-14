// Shared role catalog — Goal Setting, Fairness Testing and Payout Curve are
// configured per role as well as per product.

export type RoleRef = { id: string; name: string; short: string; factor: number };

export const ROLES: RoleRef[] = [
  { id: "rep", name: "Sales Representative", short: "Rep", factor: 1 },
  { id: "rbm", name: "Regional Business Manager", short: "RBM", factor: 1.35 },
  { id: "asm", name: "Area Sales Manager", short: "ASM", factor: 1.6 },
];

export const DEFAULT_ROLE_ID = ROLES[0].id;

export const roleIndex = (id: string) => Math.max(0, ROLES.findIndex((r) => r.id === id));

/** Composite key for state stored per role + product. */
export const scopeKey = (roleId: string, productId: string) => `${roleId}::${productId}`;
