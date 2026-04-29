import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import { Database, Users, Map as MapIcon, ArrowRight, RotateCcw, Check } from "lucide-react";
import {
  DEFAULT_INPUTS,
  loadDataInputs,
  saveDataInputs,
  type DataInputs,
} from "@/lib/data-inputs";

export const Route = createFileRoute("/data-inputs")({
  head: () => ({
    meta: [
      { title: "Data Inputs · Helix IC" },
      {
        name: "description",
        content:
          "Enter previous year sales, sales rep headcount and territory potential before designing the IC plan.",
      },
    ],
  }),
  component: DataInputsPage,
});

type FieldKey = keyof DataInputs;

const FIELDS: Array<{
  key: FieldKey;
  label: string;
  hint: string;
  prefix?: string;
  suffix?: string;
  step: number;
  min: number;
  icon: typeof Database;
}> = [
  {
    key: "previousYearSales",
    label: "Previous Year Sales",
    hint: "Total FY25 actuals across the business unit",
    prefix: "$",
    suffix: "M",
    step: 1,
    min: 0,
    icon: Database,
  },
  {
    key: "salesReps",
    label: "No. of Sales Reps",
    hint: "Eligible field-facing reps to be modeled",
    step: 1,
    min: 1,
    icon: Users,
  },
  {
    key: "territoryPotential",
    label: "Territory Potential",
    hint: "Modeled total opportunity across all territories",
    prefix: "$",
    suffix: "M",
    step: 1,
    min: 0,
    icon: MapIcon,
  },
];

function DataInputsPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<DataInputs>(DEFAULT_INPUTS);
  const [touched, setTouched] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const existing = loadDataInputs();
    if (existing) {
      setValues(existing);
      setSavedAt(Date.now());
    }
  }, []);

  const valid = FIELDS.every((f) => {
    const v = values[f.key];
    return Number.isFinite(v) && v >= f.min;
  });

  const set = (key: FieldKey, raw: string) => {
    const n = Number(raw);
    setValues((p) => ({ ...p, [key]: Number.isFinite(n) ? n : 0 }));
    setTouched(true);
  };

  const handleSaveAndContinue = () => {
    if (!valid) return;
    saveDataInputs(values);
    setSavedAt(Date.now());
    navigate({ to: "/plan-builder" });
  };

  const handleReset = () => {
    setValues(DEFAULT_INPUTS);
    setTouched(true);
  };

  return (
    <div>
      <PageHeader
        step={0}
        eyebrow="Pre-Flight"
        title="Plan Data Inputs"
        description="Enter the source data that will drive component weighting, goal setting and payout simulation. You can revisit and edit these at any time."
        prev={{ to: "/", label: "Overview" }}
        next={{ to: "/plan-builder", label: "Plan Builder" }}
      />
      <div className="px-8 py-7 max-w-[1100px] space-y-6">
        <Card className="p-0">
          <div className="px-6 pt-6 pb-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold tracking-tight">Required Inputs</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                These three values seed the entire plan-design workflow.
              </div>
            </div>
            {savedAt && !touched && (
              <Badge tone="success">
                <Check className="size-3" /> Saved
              </Badge>
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {FIELDS.map((f) => {
              const Icon = f.icon;
              const v = values[f.key];
              const invalid = !(Number.isFinite(v) && v >= f.min);
              return (
                <label key={f.key} className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-7 rounded-md bg-primary-muted text-primary grid place-items-center">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="text-[12.5px] font-semibold text-foreground">{f.label}</div>
                  </div>
                  <div
                    className={`relative flex items-center rounded-md border bg-background ${
                      invalid ? "border-destructive/60" : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30"
                    }`}
                  >
                    {f.prefix && (
                      <span className="pl-3 pr-1 text-[13px] text-muted-foreground select-none">{f.prefix}</span>
                    )}
                    <input
                      type="number"
                      inputMode="decimal"
                      min={f.min}
                      step={f.step}
                      value={Number.isFinite(v) ? v : ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      className={`w-full h-10 ${f.prefix ? "pl-1" : "pl-3"} ${f.suffix ? "pr-9" : "pr-3"} bg-transparent text-[14px] num font-medium focus:outline-none`}
                    />
                    {f.suffix && (
                      <span className="absolute right-3 text-[12px] text-muted-foreground select-none">{f.suffix}</span>
                    )}
                  </div>
                  <div className="mt-1.5 text-[11.5px] text-muted-foreground">{f.hint}</div>
                  {invalid && (
                    <div className="mt-1 text-[11px] text-destructive">Enter a value of {f.min} or greater.</div>
                  )}
                </label>
              );
            })}
          </div>

          <div className="px-6 pb-6 pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border">
            <button
              type="button"
              onClick={handleReset}
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[12.5px] font-medium text-muted-foreground hover:bg-muted"
            >
              <RotateCcw className="size-3.5" /> Reset to defaults
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!valid) return;
                  saveDataInputs(values);
                  setSavedAt(Date.now());
                  setTouched(false);
                }}
                disabled={!valid}
                className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[13px] font-medium hover:bg-muted disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleSaveAndContinue}
                disabled={!valid}
                className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 shadow-card disabled:opacity-50"
              >
                Save & Continue to Plan Builder <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium mb-2">
            How these inputs are used
          </div>
          <ul className="text-[12.5px] text-muted-foreground space-y-1.5 list-disc pl-5">
            <li><span className="text-foreground font-medium">Previous Year Sales</span> seeds the historical leg of the blended goal-setting methodology.</li>
            <li><span className="text-foreground font-medium">No. of Sales Reps</span> drives equal-distribution targets and Monte Carlo headcount.</li>
            <li><span className="text-foreground font-medium">Territory Potential</span> anchors the potential-based weighting and budget envelope.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
