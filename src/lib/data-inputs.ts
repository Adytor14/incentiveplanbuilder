import { useEffect, useState } from "react";

export type DataInputs = {
  previousYearSales: number; // in USD millions
  salesReps: number;
  territoryPotential: number; // in USD millions
};

export const DEFAULT_INPUTS: DataInputs = {
  previousYearSales: 1240,
  salesReps: 1247,
  territoryPotential: 1620,
};

const KEY = "helix.dataInputs.v1";

export function loadDataInputs(): DataInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DataInputs>;
    if (
      typeof parsed.previousYearSales === "number" &&
      typeof parsed.salesReps === "number" &&
      typeof parsed.territoryPotential === "number"
    ) {
      return parsed as DataInputs;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveDataInputs(value: DataInputs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(value));
}

export function clearDataInputs() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

// SSR-safe hook: starts with null, hydrates from localStorage on client.
export function useDataInputs() {
  const [inputs, setInputs] = useState<DataInputs | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setInputs(loadDataInputs());
    setHydrated(true);
  }, []);
  return { inputs, hydrated, setInputs };
}
