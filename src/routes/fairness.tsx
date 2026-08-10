import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import { ShieldCheck, AlertTriangle, CheckCircle2, AlertCircle, TrendingUp, Users, Sigma, Sparkles, Wand2, X } from "lucide-react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine, ComposedChart, Line } from "recharts";
import { computeRecommendations, storeRecommendations } from "@/lib/fairness-recommendations";
import { supabase } from "@/integrations/supabase/client";
import { usePlanPeriod } from "@/lib/plan-period";



export const Route = createFileRoute("/fairness")({
  head: () => ({
    meta: [
      { title: "Fairness Testing · Helix IC" },
      { name: "description", content: "Validate whether goals are equitable and achievable across reps." },
    ],
  }),
  component: Fairness,
});

type Severity = "healthy" | "caution" | "warning";

const SEV_META: Record<Severity, { label: string; tone: "success" | "warning" | "danger"; Icon: typeof CheckCircle2 }> = {
  healthy: { label: "Healthy", tone: "success", Icon: CheckCircle2 },
  caution: { label: "Caution", tone: "warning", Icon: AlertCircle },
  warning: { label: "Action needed", tone: "danger", Icon: AlertTriangle },
};

// Test 1 — Achievability fairness: goal attainment distribution
// `curve` overlays a target bell curve (Gaussian μ=100%, σ≈22) for visual comparison.
const attainmentDist = [
  { bucket: "<60%", count: 0, curve: 0.5 },
  { bucket: "60–80%", count: 2, curve: 2.4 },
  { bucket: "80–100%", count: 5, curve: 5.4 },
  { bucket: "100–120%", count: 5, curve: 5.4 },
  { bucket: "120–150%", count: 2, curve: 1.7 },
  { bucket: ">150%", count: 0, curve: 0.1 },
];

// Test 2 — Performer fairness: attainment by quartile
const quartileAttain = [
  { group: "Top 25%", lyAttain: 128, newAttain: 101 },
  { group: "Quartile 2", lyAttain: 110, newAttain: 100 },
  { group: "Quartile 3", lyAttain: 92, newAttain: 99 },
  { group: "Bottom 25%", lyAttain: 71, newAttain: 98 },
];
// Gap = (Top 25% LY attainment) − (Bottom 25% LY attainment) drop after new goals
const performerGapPts = Math.abs(
  (quartileAttain[0].lyAttain - quartileAttain[0].newAttain) -
  (quartileAttain[3].lyAttain - quartileAttain[3].newAttain)
);

function performerAssessment(gap: number): { label: string; tone: "success" | "warning" | "danger"; severity: Severity } {
  if (gap < 10) return { label: "Excellent", tone: "success", severity: "healthy" };
  if (gap < 20) return { label: "Good", tone: "success", severity: "healthy" };
  if (gap < 30) return { label: "Review", tone: "warning", severity: "caution" };
  return { label: "Unfair", tone: "danger", severity: "warning" };
}
const performerVerdict = performerAssessment(performerGapPts);

// Test 3 — Goal growth fairness: # reps per growth range
const growthDist = [
  { bucket: "0–10%", count: 6 },
  { bucket: "10–20%", count: 5 },
  { bucket: "20–30%", count: 3 },
  { bucket: ">30%", count: 1 },
];
const medianGrowthPct = 12; // illustrative

function Fairness() {
  const navigate = useNavigate();
  const { period } = usePlanPeriod();
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);


  const hasActionableRecs = performerGapPts >= 20 || growthDist[3].count > 2;

  const recs = useMemo(
    () => computeRecommendations(performerGapPts, growthDist[3].count, medianGrowthPct),
    []
  );

  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    storeRecommendations(recs);

    // Applying recommendations creates a NEW plan version rather than
    // modifying the version currently being edited.
    try {
      const stamp = new Date();
      const { data } = await supabase
        .from("ic_plan_versions")
        .insert({
          name: `Fairness-adjusted · ${stamp.toLocaleDateString()} ${stamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          quarter: period,
          status: "Draft",
          created_by: "Shreya Mehta",
        })
        .select()
        .maybeSingle();
      if (data?.id && typeof window !== "undefined") {
        localStorage.setItem("ic_active_version", data.id);
      }
    } catch {
      // non-blocking — recommendations still apply locally
    }

    setApplying(false);
    setShowApplyConfirm(false);
    navigate({ to: "/goal-setting" });
  };


  return (
    <div>
      <PageHeader
        step={4}
        title="Fairness Testing"
        prev={{ to: "/goal-setting", label: "Goal Setting" }}
        next={{ to: "/payout-curve", label: "Payout Curve" }}
      />
      <div className="px-8 py-4 max-w-[1600px] space-y-4">
        {/* Row 1: Three tests side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Test 1 — Achievability fairness */}
          <TestCard
            icon={TrendingUp}
            title="Achievability Fairness"
            subtitle="Are goals similarly achievable across reps?"
            severity="healthy"
            insight="Goal attainment distribution is roughly bell-shaped and centred around 100%. Most reps clustered near target, thin tails on either side."
          >
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={attainmentDist} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <Bar dataKey="count" name="Reps" radius={[3, 3, 0, 0]}>
                    {attainmentDist.map((d, i) => (
                      <Cell key={i} fill={d.bucket.includes(">") || d.bucket.includes("<") ? "var(--warning)" : "var(--chart-1)"} />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="curve"
                    name="Target bell curve"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    dot={{ r: 2.5, fill: "var(--chart-2)", strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[var(--chart-1)]" /> Actual reps</span>
              <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3 h-[2px] bg-[var(--chart-2)]" style={{ backgroundImage: "repeating-linear-gradient(90deg,var(--chart-2) 0 3px,transparent 3px 5px)" }} /> Target bell curve (μ=100%)</span>
            </div>
          </TestCard>

          {/* Test 2 — Performer fairness */}
          <TestCard
            icon={Users}
            title="Performer Fairness"
            subtitle="Are strong performers getting disproportionately easy goals?"
            severity={performerVerdict.severity}
            insight={`Top performers historically attained ${quartileAttain[0].lyAttain}% and are projected at ${quartileAttain[0].newAttain}%. Bottom performers were at ${quartileAttain[3].lyAttain}% historically and projected at ${quartileAttain[3].newAttain}%. Gap shift is ${performerGapPts} pts — ${performerVerdict.label.toLowerCase()}.`}
            recommendation={
              performerGapPts >= 20
                ? ["Increase Territory Potential weight", "Decrease Historical Sales weight"]
                : undefined
            }
          >
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quartileAttain} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="group" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <Bar dataKey="lyAttain" name="LY Attainment" fill="var(--muted-foreground)" radius={[2, 2, 0, 0]} barSize={16} />
                  <Bar dataKey="newAttain" name="Expected New Attainment" fill="var(--chart-1)" radius={[2, 2, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </TestCard>

          {/* Test 3 — Goal growth fairness */}
          <TestCard
            icon={Sigma}
            title="Goal Growth Fairness"
            subtitle="Are some reps receiving unrealistic goal increases?"
            severity={medianGrowthPct > 20 ? "warning" : medianGrowthPct > 15 ? "caution" : "healthy"}
            insight={`Median goal growth is ${medianGrowthPct}% (target ≈ 10%). Most reps fall in the 0–20% range; ${growthDist[3].count} rep(s) have >30% growth — review those outliers.`}
            recommendation={
              growthDist[3].count > 2
                ? ["Cap maximum goal growth", "Smooth growth across reps"]
                : undefined
            }
          >
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthDist} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <ReferenceLine x="10–20%" stroke="var(--primary)" strokeDasharray="4 4" label={{ value: "Target ≈ 10%", position: "top", fontSize: 9, fill: "var(--primary)" }} />
                  <Bar dataKey="count" name="Reps" radius={[3, 3, 0, 0]}>
                    {growthDist.map((d, i) => (
                      <Cell key={i} fill={d.bucket === ">30%" ? "var(--warning)" : "var(--chart-2)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TestCard>
        </div>

        {/* Row 2: Fairness Recommendations — full width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <Card className="p-0 w-full relative overflow-hidden">
            {/* Prominent left accent strip */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-success to-primary" />
            <div className="px-5 pt-4 pb-2.5 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-success/15 text-success grid place-items-center shrink-0">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold tracking-tight">Fairness Recommendations</div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5">Auto-generated from test results</div>
                </div>
              </div>
              {hasActionableRecs && (
                <button
                  onClick={() => setShowApplyConfirm(true)}
                  className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-success text-success-foreground text-[13px] font-semibold hover:opacity-90 shadow-card"
                >
                  <Wand2 className="size-3.5" /> Apply Recommendations
                </button>
              )}
            </div>
            <div className="px-5 py-3">
              <ul className="flex-1 space-y-2 text-[12.5px]">
                {performerGapPts >= 20 && (
                  <>
                    <RecItem tone="danger" text="Decrease Historical Sales Weight (high quartile gap)" />
                    <RecItem tone="danger" text="Increase Territory Potential Weight" />
                  </>
                )}
                {growthDist[3].count > 2 && (
                  <RecItem tone="warning" text="Cap or smooth goal growth above 30%" />
                )}
                <RecItem tone="info" text="Confirm attainment distribution stays bell-shaped after weight changes" />
              </ul>
            </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Apply Recommendations Confirmation Modal */}
      {showApplyConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-lg w-full p-0">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-success/15 text-success grid place-items-center">
                <Wand2 className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold">Apply Fairness Recommendations?</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  This creates a new plan version with the adjusted inputs and opens Goal Setting.
                </div>
              </div>
              <button onClick={() => setShowApplyConfirm(false)} className="size-7 grid place-items-center rounded-md hover:bg-muted">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="text-[12.5px] text-muted-foreground">The following adjustments will be made:</div>
              <div className="space-y-2">
                {recs.reason.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12.5px]">
                    <CheckCircle2 className="size-3.5 text-success shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
                <div className="flex items-start gap-2 text-[12.5px]">
                  <CheckCircle2 className="size-3.5 text-success shrink-0 mt-0.5" />
                  <span>Updated weights will be saved for Goal Setting.</span>
                </div>
                <div className="flex items-start gap-2 text-[12.5px]">
                  <CheckCircle2 className="size-3.5 text-success shrink-0 mt-0.5" />
                  <span>Monte Carlo simulation will run automatically with new parameters.</span>
                </div>
              </div>
              <div className="rounded-md bg-muted/40 border border-border p-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground font-medium">Historical</div>
                  <div className="text-[14px] font-semibold num mt-0.5">{recs.wHist}%</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground font-medium">Potential</div>
                  <div className="text-[14px] font-semibold num mt-0.5">{recs.wPot}%</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground font-medium">Equal</div>
                  <div className="text-[14px] font-semibold num mt-0.5">{recs.wEqual}%</div>
                </div>
              </div>
            </div>
            <div className="px-5 pb-4 flex justify-end gap-2">
              <button
                onClick={() => setShowApplyConfirm(false)}
                className="h-9 px-3.5 rounded-md border border-border bg-background text-[13px] font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="h-9 px-4 rounded-md bg-success text-success-foreground text-[13px] font-semibold hover:opacity-90 shadow-card inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Wand2 className="size-3.5" /> {applying ? "Creating version…" : "Create Version & Review Goals"}
              </button>

            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function TestCard({
  icon: Icon, title, subtitle, severity, insight, recommendation, children,
}: {
  icon: typeof CheckCircle2; title: string; subtitle: string;
  severity: Severity; insight: string; recommendation?: string[]; children: React.ReactNode;
}) {
  const meta = SEV_META[severity];
  const SevIcon = meta.Icon;
  return (
    <Card className="p-0 flex flex-col h-full">
      <div className="px-4 pt-4 pb-2.5 flex items-start justify-between gap-2 border-b border-border">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-primary-muted text-primary grid place-items-center shrink-0">
            <Icon className="size-3.5" />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold tracking-tight leading-tight">{title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{subtitle}</div>
          </div>
        </div>
        {recommendation ? (
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="shrink-0 p-0 m-0 border-0 bg-transparent inline-flex cursor-pointer">
                <Badge tone={meta.tone}><SevIcon className="size-3" /> {meta.label}</Badge>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="text-[10px] uppercase tracking-[0.06em] text-warning font-semibold mb-1.5">
                Recommended Actions
              </div>
              <ul className="text-[11.5px] text-foreground space-y-0.5 list-disc pl-4">
                {recommendation.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <Badge tone={meta.tone} className="shrink-0"><SevIcon className="size-3" /> {meta.label}</Badge>
        )}
      </div>
      <div className="px-4 py-3 flex-1">{children}</div>
      <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-[11.5px] text-foreground leading-snug">
        <span className="font-semibold">Insight: </span>{insight}
      </div>
    </Card>
  );
}


function RecItem({ tone, text }: { tone: "danger" | "warning" | "info"; text: string }) {
  const dotCls = { danger: "bg-destructive", warning: "bg-warning", info: "bg-info" }[tone];
  return (
    <li className="flex items-start gap-2.5">
      <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${dotCls}`} />
      <span>{text}</span>
    </li>
  );
}
