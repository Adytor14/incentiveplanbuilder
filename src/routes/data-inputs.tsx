import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import {
  CheckCircle2,
  AlertTriangle,
  CircleDashed,
  Upload,
  RefreshCw,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";
import { usePlanPeriod, PLAN_PERIODS } from "@/lib/plan-period";
import {
  DATASETS as INITIAL_DATASETS,
  datasetsReady,
  type Dataset,
  type DatasetStatus,
} from "@/lib/data-inputs";

export const Route = createFileRoute("/data-inputs")({
  head: () => ({
    meta: [
      { title: "Data Inputs · IC Design" },
      {
        name: "description",
        content:
          "Validate the source datasets that drive plan design — HCP sales, alignment, roster, territory potential and MBOs.",
      },
    ],
  }),
  component: DataInputsPage,
});

const STATUS_META: Record<
  DatasetStatus,
  { label: string; tone: "success" | "warning" | "danger"; Icon: typeof CheckCircle2 }
> = {
  validated: { label: "Validated", tone: "success", Icon: CheckCircle2 },
  warning: { label: "Needs review", tone: "warning", Icon: AlertTriangle },
  missing: { label: "Missing", tone: "danger", Icon: CircleDashed },
};

function DataInputsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>(INITIAL_DATASETS);
  const ready = datasetsReady(datasets);
  const validated = datasets.filter((d) => d.status === "validated").length;

  const revalidate = (id: string) =>
    setDatasets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "validated", updatedAt: "Just now" } : d)),
    );

  return (
    <div>
      <PageHeader
        step={0}
        eyebrow="Pre-Flight"
        title="Data Inputs"
        description="The datasets below seed every downstream screen. Goals, potential and rep counts are read from these files — no manually entered totals."
        prev={{ to: "/", label: "Overview" }}
        next={{ to: "/plan-builder", label: "Plan Builder" }}
      />
      <div className="px-8 py-7 max-w-[1400px] space-y-6">
        <Card className="p-0">
          <div className="px-6 pt-5 pb-4 border-b border-border flex items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                <Database className="size-3.5 text-primary" /> Required Datasets
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                {validated} of {datasets.length} validated · all required datasets must be present before the Plan Builder can run.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={ready ? "success" : "warning"}>
                {ready ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
                {ready ? "Ready to build plan" : "Resolve warnings"}
              </Badge>
            </div>
          </div>

          <div className="divide-y divide-border">
            {datasets.map((d) => {
              const meta = STATUS_META[d.status];
              const Icon = meta.Icon;
              return (
                <div key={d.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-muted/60 grid place-items-center shrink-0">
                    <FileSpreadsheet className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[13.5px] font-semibold text-foreground truncate">
                        {d.name}
                      </div>
                      <Badge tone="neutral">{d.source}</Badge>
                      {d.required && <Badge tone="primary">Required</Badge>}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5 truncate">
                      {d.description}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 num">
                      {d.rows !== null ? `${d.rows.toLocaleString()} rows` : "—"} · updated {d.updatedAt ?? "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone={meta.tone}>
                      <Icon className="size-3" /> {meta.label}
                    </Badge>
                    {d.status === "warning" ? (
                      <button
                        type="button"
                        onClick={() => revalidate(d.id)}
                        className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[12px] font-medium hover:bg-muted"
                      >
                        <RefreshCw className="size-3.5" /> Re-validate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[12px] font-medium hover:bg-muted"
                      >
                        <Upload className="size-3.5" /> Replace
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
            <div className="text-[12px] text-muted-foreground">
              Aggregates (previous year sales, # of reps, territory potential) are computed from these files — not entered as single numbers.
            </div>
            <Link
              to="/plan-builder"
              className={`h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold shadow-card ${
                ready
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground pointer-events-none"
              }`}
            >
              Continue to Plan Builder <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium mb-2">
            How these datasets are used
          </div>
          <ul className="text-[12.5px] text-muted-foreground space-y-1.5 list-disc pl-5">
            <li>
              <span className="text-foreground font-medium">HCP Historical Sales</span> feeds the Historical Component of goal setting at HCP / territory grain (never a single national total).
            </li>
            <li>
              <span className="text-foreground font-medium">Territory Alignment</span> determines the rep / territory roster — # of reps is read from here, not entered manually.
            </li>
            <li>
              <span className="text-foreground font-medium">Territory Potential</span> drives the Potential Component. Competitor units per HCP preferred; territory-level sales used as fallback.
            </li>
            <li>
              <span className="text-foreground font-medium">MBO Definitions</span> mirror the MBO catalog already configured in IC Admin so the Plan Builder stays consistent.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
