// Dataset registry for the IC Design "Data Inputs" step.
// Replaces the old singular-number form per feedback: territory potential,
// previous-year sales and rep counts must come from territory/HCP-level
// files (or the IC Admin alignment file), never a manually entered number.

export type DatasetStatus = "validated" | "warning" | "missing";

export type Dataset = {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: DatasetStatus;
  rows: number | null;
  updatedAt: string | null;
  source: "Upload" | "IC Admin" | "External";
};

export const DATASETS: Dataset[] = [
  {
    id: "hcp_sales",
    name: "HCP Historical Sales",
    description: "HCP-level TRx / NRx, last 8 quarters",
    required: true,
    status: "validated",
    rows: 184_320,
    updatedAt: "Jun 5, 2026",
    source: "Upload",
  },
  {
    id: "alignment",
    name: "Territory Alignment",
    description: "Rep ↔ Territory ↔ HCP mapping · drives # of reps",
    required: true,
    status: "validated",
    rows: 1_247,
    updatedAt: "Jun 4, 2026",
    source: "IC Admin",
  },
  {
    id: "managers",
    name: "Sales Managers",
    description: "RBM / ASM roster and reporting hierarchy",
    required: true,
    status: "validated",
    rows: 96,
    updatedAt: "Jun 4, 2026",
    source: "IC Admin",
  },
  {
    id: "reps",
    name: "Sales Representatives",
    description: "Active rep roster with employee info",
    required: true,
    status: "validated",
    rows: 1_247,
    updatedAt: "Jun 4, 2026",
    source: "IC Admin",
  },
  {
    id: "potential",
    name: "Territory Potential",
    description: "Competitor units per HCP · falls back to territory-level sales",
    required: true,
    status: "warning",
    rows: 184_320,
    updatedAt: "Jun 3, 2026",
    source: "External",
  },
  {
    id: "mbos",
    name: "MBO Definitions",
    description: "MBO catalog synced from IC Admin",
    required: true,
    status: "validated",
    rows: 12,
    updatedAt: "Jun 4, 2026",
    source: "IC Admin",
  },
];

// Aggregate values derived from the datasets. Kept here so downstream
// screens (Plan Builder, Dashboard) can show summary KPIs without each
// having to re-aggregate the raw files.
export type DataInputs = {
  previousYearSales: number; // $M
  salesReps: number;
  territoryPotential: number; // $M
};

export const AGGREGATES: DataInputs = {
  previousYearSales: 1_240,
  salesReps: 1_247,
  territoryPotential: 1_620,
};

// Back-compat exports — old API surface, now driven by AGGREGATES.
export const DEFAULT_INPUTS = AGGREGATES;
export function loadDataInputs(): DataInputs {
  return AGGREGATES;
}
export function saveDataInputs(_v: DataInputs) {
  /* no-op: inputs now derive from datasets */
}
export function clearDataInputs() {
  /* no-op */
}
export function useDataInputs() {
  return { inputs: AGGREGATES, hydrated: true, setInputs: (_: DataInputs) => {} };
}

export function datasetsReady(list: Dataset[] = DATASETS) {
  return list.filter((d) => d.required).every((d) => d.status !== "missing");
}
