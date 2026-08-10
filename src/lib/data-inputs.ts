// Dataset registry for the IC Design "Data Inputs" step.

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
    id: "roster",
    name: "Employee Roster",
    description: "Sales Reps, Regional Managers, Area Managers · roles & reporting hierarchy",
    required: true,
    status: "validated",
    rows: 1_343,
    updatedAt: "Jun 4, 2026",
    source: "IC Admin",
  },
  {
    id: "geography",
    name: "Geography Alignment",
    description: "Territory mapping and role definitions",
    required: true,
    status: "validated",
    rows: 1_247,
    updatedAt: "Jun 4, 2026",
    source: "IC Admin",
  },
  {
    id: "historical_sales",
    name: "Historical Sales",
    description: "Prior-year monthly sales · rollup at Rep / Territory / Region level",
    required: true,
    status: "validated",
    rows: 184_320,
    updatedAt: "Jun 5, 2026",
    source: "Upload",
  },
  {
    id: "potential",
    name: "Territory Potential",
    description: "Quarterly territory potential values",
    required: true,
    status: "warning",
    rows: 4_988,
    updatedAt: "Jun 3, 2026",
    source: "External",
  },
  {
    id: "historical_goals",
    name: "Historical Goals and Payout",
    description: "Goals, attainment and payouts from prior cycles",
    required: true,
    status: "validated",
    rows: 6_240,
    updatedAt: "Jun 4, 2026",
    source: "IC Admin",
  },
  {
    id: "comp_inputs",
    name: "Compensation Inputs",
    description: "Role-level target pay (Rep / RM / AM)",
    required: true,
    status: "validated",
    rows: 3,
    updatedAt: "Jun 4, 2026",
    source: "Upload",
  },
  {
    id: "ic_component_library",
    name: "IC Component Library",
    description: "IC component type, description and definition catalog",
    required: true,
    status: "validated",
    rows: 12,
    updatedAt: "Jun 4, 2026",
    source: "IC Admin",
  },
  {
    id: "products",
    name: "Products",
    description: "Product catalog with product codes, brands and eligibility by role",
    required: true,
    status: "validated",
    rows: 3,
    updatedAt: "Jun 5, 2026",
    source: "IC Admin",
  },
];


export type DataInputs = {
  previousYearSales: number;
  salesReps: number;
  territoryPotential: number;
};

export const AGGREGATES: DataInputs = {
  previousYearSales: 1_240,
  salesReps: 1_247,
  territoryPotential: 1_620,
};

export const DEFAULT_INPUTS = AGGREGATES;
export function loadDataInputs(): DataInputs {
  return AGGREGATES;
}
export function saveDataInputs(_v: DataInputs) {}
export function clearDataInputs() {}
export function useDataInputs() {
  return { inputs: AGGREGATES, hydrated: true, setInputs: (_: DataInputs) => {} };
}

export function datasetsReady(list: Dataset[] = DATASETS) {
  return list.filter((d) => d.required).every((d) => d.status !== "missing");
}
