import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import {
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Calendar,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { usePlanPeriod, PLAN_PERIODS } from "@/lib/plan-period";
import {
  DATASETS as INITIAL_DATASETS,
  datasetsReady,
  type Dataset,
} from "@/lib/data-inputs";
import { supabase } from "@/integrations/supabase/client";

type PlanVersion = { id: string; name: string; created_at: string };

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


function DataInputsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>(INITIAL_DATASETS);
  const { period, setPeriod } = usePlanPeriod();
  const ready = datasetsReady(datasets);
  const validated = datasets.filter((d) => d.status === "validated").length;

  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string>("");
  const [loadingVersions, setLoadingVersions] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("ic_plan_versions")
        .select("*")
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (!error && data) {
        setVersions(data as PlanVersion[]);
        const stored = typeof window !== "undefined" ? localStorage.getItem("ic_active_version") : null;
        const pick = data.find((v) => v.id === stored)?.id ?? data[0]?.id ?? "";
        setActiveVersionId(pick);
      }
      setLoadingVersions(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeVersionId && typeof window !== "undefined") {
      localStorage.setItem("ic_active_version", activeVersionId);
    }
  }, [activeVersionId]);

  const createVersion = async () => {
    const name = window.prompt("Name this IC plan version", `Version ${versions.length + 1}`);
    if (!name?.trim()) return;
    const { data, error } = await supabase
      .from("ic_plan_versions")
      .insert({ name: name.trim() })
      .select()
      .single();
    if (!error && data) {
      setVersions((prev) => [...prev, data as PlanVersion]);
      setActiveVersionId((data as PlanVersion).id);
    }
  };

  const deleteActiveVersion = async () => {
    if (!activeVersionId || versions.length <= 1) return;
    const v = versions.find((x) => x.id === activeVersionId);
    if (!v) return;
    if (!window.confirm(`Delete "${v.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("ic_plan_versions").delete().eq("id", activeVersionId);
    if (!error) {
      const next = versions.filter((x) => x.id !== activeVersionId);
      setVersions(next);
      setActiveVersionId(next[0]?.id ?? "");
    }
  };

  const revalidate = (id: string) =>
    setDatasets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "validated", updatedAt: "Just now" } : d)),
    );

  return (
    <div>
      <PageHeader
        step={1}
        title="Data Inputs"
        prev={{ to: "/", label: "Home" }}
        next={{ to: "/plan-builder", label: "Plan Builder" }}
      />
      <div className="px-8 py-7 max-w-[1400px] space-y-6">
        <Card className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary-muted text-primary grid place-items-center">
              <Calendar className="size-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold tracking-tight">Plan Period</div>
              <div className="text-[12px] text-muted-foreground">
                This selection drives all downstream calculations.
              </div>
            </div>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="h-9 px-3 rounded-md border border-border bg-background text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
          >
            {PLAN_PERIODS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Card>

        <Card className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary-muted text-primary grid place-items-center">
              <Layers className="size-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold tracking-tight">IC Plan Version</div>
              <div className="text-[12px] text-muted-foreground">
                Pick a previous version of the IC plan, or continue building a new one.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeVersionId}
              onChange={(e) => setActiveVersionId(e.target.value)}
              disabled={loadingVersions}
              className="h-9 px-3 rounded-md border border-border bg-background text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary min-w-[220px]"
            >
              <option value="">Build a new plan</option>
              {loadingVersions && <option disabled>Loading…</option>}
              {versions.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={createVersion}
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[12.5px] font-medium hover:bg-muted"
            >
              <Plus className="size-3.5" /> Save as version
            </button>
            <button
              type="button"
              onClick={deleteActiveVersion}
              disabled={!activeVersionId}
              className="h-9 px-2.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[12.5px] font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              title="Delete current version"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </Card>


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
            {datasets.map((d) => (
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
                      <Upload className="size-3.5" /> Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
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

      </div>
    </div>
  );
}
