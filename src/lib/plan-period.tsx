import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type PlanPeriod = "Q1 2026" | "Q2 2026" | "Q3 2026" | "Q4 2026" | "Q1 2027" | "Q2 2027";

export const PLAN_PERIODS: PlanPeriod[] = [
  "Q1 2026",
  "Q2 2026",
  "Q3 2026",
  "Q4 2026",
  "Q1 2027",
  "Q2 2027",
];

const STORAGE_KEY = "ic.planPeriod";

type Ctx = {
  period: PlanPeriod;
  setPeriod: (p: PlanPeriod) => void;
  previousPeriod: PlanPeriod;
};

const PlanPeriodContext = createContext<Ctx | null>(null);

export function previousQuarter(p: PlanPeriod): PlanPeriod {
  const idx = PLAN_PERIODS.indexOf(p);
  const prevIdx = idx > 0 ? idx - 1 : 0;
  return PLAN_PERIODS[prevIdx];
}

/** Returns the last `count` quarters strictly before `p`, most recent first. */
export function previousQuartersBefore(p: string, count = 4): string[] {
  const m = /^Q([1-4])\s(\d{4})$/.exec(p);
  if (!m) return [];
  let q = Number(m[1]);
  let y = Number(m[2]);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    q -= 1;
    if (q === 0) { q = 4; y -= 1; }
    out.push(`Q${q} ${y}`);
  }
  return out;
}

export function PlanPeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriodState] = useState<PlanPeriod>("Q2 2026");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as PlanPeriod | null;
    if (saved && PLAN_PERIODS.includes(saved)) setPeriodState(saved);
  }, []);

  const setPeriod = (p: PlanPeriod) => {
    setPeriodState(p);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, p);
  };

  return (
    <PlanPeriodContext.Provider
      value={{ period, setPeriod, previousPeriod: previousQuarter(period) }}
    >
      {children}
    </PlanPeriodContext.Provider>
  );
}

export function usePlanPeriod() {
  const ctx = useContext(PlanPeriodContext);
  if (!ctx) throw new Error("usePlanPeriod must be used within PlanPeriodProvider");
  return ctx;
}
