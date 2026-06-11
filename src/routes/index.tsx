import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, History } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlanPeriod } from "@/lib/plan-period";
import { supabase } from "@/integrations/supabase/client";

type PlanVersion = { id: string; name: string; created_at: string };

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

const STEPS = [
  { icon: Database, label: "Data Inputs", to: "/data-inputs" },
  { icon: Layers, label: "Plan Builder", to: "/plan-builder" },
  { icon: Target, label: "Goal Setting", to: "/goal-setting" },
  { icon: ShieldCheck, label: "Fairness Testing", to: "/fairness" },
  { icon: TrendingUp, label: "Payout Curve", to: "/payout-curve" },
  { icon: FileText, label: "Reports & Outputs", to: "/reports" },
] as const;

function Home() {
  const { period } = usePlanPeriod();
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);

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

  const selectVersion = (id: string) => {
    if (typeof window !== "undefined") localStorage.setItem("ic_active_version", id);
  };

  return (
    <div className="px-8 py-12 max-w-[1100px] mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.13_262)] text-primary-foreground shadow-premium">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-info/20 blur-3xl" />
        <div className="relative px-10 py-14">
          <div className="inline-flex items-center gap-2 px-2.5 h-6 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium backdrop-blur">
            <Sparkles className="size-3" /> Planning Cycle · {period}
          </div>
          <h1 className="mt-5 text-[40px] font-semibold tracking-tight leading-[1.1] text-balance max-w-3xl">
            Design incentive plans that drive motivation, fairness, and business results.
          </h1>
          <div className="mt-8">
            <Link
              to="/data-inputs"
              className="h-11 px-5 inline-flex items-center gap-2 rounded-md bg-white text-primary text-[14px] font-semibold hover:bg-white/90 shadow-elevated"
            >
              Begin Plan Design <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>


      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[12px] uppercase tracking-[0.1em] text-muted-foreground font-semibold flex items-center gap-2">
            <History className="size-3.5" /> IC Plan Versions
          </div>
          <Link
            to="/data-inputs"
            className="text-[12px] font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            Build a new plan <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-[11.5px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Version</th>
                <th className="text-left font-semibold px-5 py-3">Created</th>
                <th className="text-right font-semibold px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingVersions && (
                <tr><td colSpan={3} className="px-5 py-6 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loadingVersions && versions.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-6 text-center text-muted-foreground">No saved versions yet.</td></tr>
              )}
              {versions.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-foreground">{v.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(v.created_at).toLocaleString()}</td>
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
