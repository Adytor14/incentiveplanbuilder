// Local draft of the plan configuration for the version currently being edited.
// Each workflow screen writes its own part; Reports submits the whole thing to
// HQ as an approval request stored on the plan version row.

export type GoalDraft = {
  historicalPeriod: string;
  growth: number;
  wHist: number;
  wPot: number;
  wEqual: number;
};

export type CurvePointDraft = { name: string; attainment: number; payout: number };

export type ProductWeightDraft = {
  product: string;
  weight: number;
  components: { type: string; subtype: string; weight: number }[];
};

export type PlanDraft = {
  /** keyed by product id */
  goals?: Record<string, GoalDraft>;
  /** keyed by "roleId::productId" */
  curves?: Record<string, CurvePointDraft[]>;
  /** keyed by role id */
  weights?: Record<string, ProductWeightDraft[]>;
  period?: string;
};

export const ACTIVE_VERSION_KEY = "ic_active_version";

export function activeVersionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_VERSION_KEY);
}

const draftKey = (id: string | null) => `ic_plan_draft:${id ?? "new"}`;

export function loadDraft(id: string | null = activeVersionId()): PlanDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(draftKey(id));
    return raw ? (JSON.parse(raw) as PlanDraft) : {};
  } catch {
    return {};
  }
}

export function saveDraftPart<K extends keyof PlanDraft>(part: K, value: PlanDraft[K]) {
  if (typeof window === "undefined") return;
  const id = activeVersionId();
  const next = { ...loadDraft(id), [part]: value };
  localStorage.setItem(draftKey(id), JSON.stringify(next));
}
