import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, History } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlanPeriod } from "@/lib/plan-period";
import { supabase } from "@/integrations/supabase/client";

type PlanVersion = {
  id: string;
  name: string;
  created_at: string;
  quarter: string | null;
  last_used_at: string | null;
  created_by: string | null;
  status: string;
};

type StatusFilter = "All" | "Draft" | "In Review" | "Approved";

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border border-border",
  "In Review": "bg-warning/15 text-warning border border-warning/30",
  Approved: "bg-success/15 text-success border border-success/30",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · Helix IC" },
      {
        name: "description",
        content:
          "Design incentive plans that drive motivation, fairness, and business results.",
      },
    ],
  }),
  component: Home,
});


function Home() {
  const { period } = usePlanPeriod();
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("ic_plan_versions")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (!error && data) setVersions(data as PlanVersion[]);
      setLoadingVersions(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredVersions =
    statusFilter === "All"
      ? versions
      : versions.filter((v) => v.status === statusFilter);

  const selectVersion = async (id: string) => {
    if (typeof window !== "undefined") localStorage.setItem("ic_active_version", id);
    const nowIso = new Date().toISOString();
    setVersions((prev) =>
      prev.map((v) => (v.id === id ? { ...v, last_used_at: nowIso } : v)),
    );
    await supabase.from("ic_plan_versions").update({ last_used_at: nowIso }).eq("id", id);
  };

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString() : "—";

  return (
    <div className="px-8 py-12 max-w-[1100px] mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.13_262)] text-primary-foreground shadow-premium">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-info/20 blur-3xl" />
        <div className="relative px-10 py-14">
          <h1 className="text-[40px] font-semibold tracking-tight leading-[1.1] text-balance max-w-3xl">
            Design incentive plans that drive motivation, fairness, and business results.
          </h1>
        </div>
      </div>


      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[12px] uppercase tracking-[0.1em] text-muted-foreground font-semibold flex items-center gap-2">
            <History className="size-3.5" /> IC Plan Versions
          </div>
          <Link
            to="/data-inputs"
            onClick={() => {
              if (typeof window !== "undefined") localStorage.removeItem("ic_active_version");
            }}
            className="h-9 px-4 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 shadow-sm"
          >
            Build New IC Plan <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="flex items-center gap-2 mb-4">
          {(["All", "Draft", "In Review", "Approved"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-7 px-3 rounded-full text-[12px] font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-[11.5px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Version</th>
                <th className="text-left font-semibold px-5 py-3">Quarter</th>
                <th className="text-left font-semibold px-5 py-3">Status</th>
                <th className="text-left font-semibold px-5 py-3">Created by</th>
                <th className="text-left font-semibold px-5 py-3">Created</th>
                <th className="text-left font-semibold px-5 py-3">Last autosaved</th>
                <th className="text-right font-semibold px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingVersions && (
                <tr><td colSpan={7} className="px-5 py-6 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loadingVersions && filteredVersions.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-6 text-center text-muted-foreground">No saved versions yet.</td></tr>
              )}
              {filteredVersions.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-foreground">{v.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{v.quarter ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center h-6 px-2 rounded-full text-[11px] font-semibold ${STATUS_STYLES[v.status] ?? "bg-muted text-muted-foreground"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{v.created_by ?? "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{fmt(v.created_at)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{fmt(v.last_used_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to="/data-inputs"
                      onClick={() => selectVersion(v.id)}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-border bg-background text-[12px] font-medium hover:bg-muted"
                    >
                      Open <ArrowRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
