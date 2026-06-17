import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import { Info, AlertTriangle, X, Calculator, Eye, CheckCircle2 } from "lucide-react";
import { loadRecommendations } from "@/lib/fairness-recommendations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlanPeriod, previousQuarter, previousQuartersBefore } from "@/lib/plan-period";

export const Route = createFileRoute("/goal-setting")({
  head: () => ({
    meta: [
      { title: "Goal Setting · IC Design" },
      {
        name: "description",
        content: "Allocate weights across Historical Sales, Territory Potential and Equal Distribution components.",
      },
    ],
  }),
  component: GoalSetting,
});

const REPS = [
  { rep: "A. Kapoor", region: "NE", historical: 12, potential: 16 },
  { rep: "M. Chen", region: "W", historical: 10, potential: 15 },
  { rep: "R. Patel", region: "SW", historical: 15, potential: 17 },
  { rep: "J. Williams", region: "SE", historical: 11, potential: 14 },
  { rep: "T. Nakamura", region: "MW", historical: 14, potential: 15 },
  { rep: "L. García", region: "W", historical: 9, potential: 13 },
];
const NATIONAL_TARGET_K = 100_000;
const REP_COUNT = 15;

function GoalSetting() {
  const navigate = useNavigate();
  const { period } = usePlanPeriod();
  const historicalOptions = useMemo(() => previousQuartersBefore(period, 4), [period]);
  const [historicalPeriod, setHistoricalPeriod] = useState<string>(previousQuarter(period));
  const [growth, setGrowth] = useState<number>(1.10);
  const [wHist, setWHist] = useState(50);
  const [wPot, setWPot] = useState(30);
  const [wEqual, setWEqual] = useState(20);
  const [showInvalid, setShowInvalid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [appliedRecs, setAppliedRecs] = useState<ReturnType<typeof loadRecommendations>>(null);

  // Auto-apply fairness weight recommendations on mount
  useEffect(() => {
    const recs = loadRecommendations();
    if (recs) {
      setAppliedRecs(recs);
      setWHist(recs.wHist);
      setWPot(recs.wPot);
      setWEqual(recs.wEqual);
      setGrowth(1 + recs.growthPercent / 100);
    }
  }, []);

  const total = wHist + wPot + wEqual;
  const balanced = total === 100;
  const equalShare = NATIONAL_TARGET_K / REP_COUNT;

  const preview = useMemo(() => {
    return REPS.map((r) => {
      const histContrib = r.historical * growth;
      const potContrib = r.potential * 0.88;
      const eqContrib = equalShare;
      const goal = (histContrib * wHist + potContrib * wPot + eqContrib * wEqual) / 100;
      return { ...r, histContrib: Math.round(histContrib), potContrib: Math.round(potContrib), eqContrib: Math.round(eqContrib), goal: Math.round(goal) };
    });
  }, [wHist, wPot, wEqual, growth, equalShare]);

  const sample = preview[0];

  const handleContinue = () => {
    if (!balanced) { setShowInvalid(true); return; }
    navigate({ to: "/fairness" });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        step={3}
        title={
          <span className="inline-flex items-center gap-2">
            Goal Setting
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center size-6 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-[12px] leading-relaxed">
                  Goal = (Historical × W₁) + (Potential × W₂) + (Equal Distribution × W₃). Weights must sum to 100%.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        }
        prev={{ to: "/plan-builder", label: "Plan Builder" }}
        actions={
          <button
            type="button"
            onClick={handleContinue}
            className={`h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold shadow-card ${
              balanced ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground"
            }`}
          >
            Continue to Fairness Testing
          </button>
        }
      />

      {/* Applied-recommendations banner */}
      {appliedRecs && (
        <div className="px-8 pt-5 pb-0 max-w-[1600px] mx-auto">
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success shrink-0" />
              <span className="text-[13px] font-semibold text-success">Fairness recommendations applied</span>
            </div>
            <div className="flex-1 text-[12.5px] text-muted-foreground">
              Weights updated: Historical <span className="font-semibold text-foreground">{appliedRecs.wHist}%</span>, Potential <span className="font-semibold text-foreground">{appliedRecs.wPot}%</span>, Equal <span className="font-semibold text-foreground">{appliedRecs.wEqual}%</span>. Growth set to <span className="font-semibold text-foreground">{(appliedRecs.growthPercent / 100).toFixed(2)}x</span>.
            </div>
            <button
              onClick={() => setAppliedRecs(null)}
              className="size-7 grid place-items-center rounded-md hover:bg-success/20 shrink-0"
            >
              <X className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      <div className="px-8 py-5 max-w-[1600px] mx-auto space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Historical */}
          <ComponentCard
            accent="bg-chart-1"
            title="Historical Sales"
            description="Uses historical sales performance as the basis for goal creation."
            weight={wHist}
            onWeightChange={setWHist}
          >
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Historical Time Period"
                hint={`Defaults to the quarter before ${period}.`}
              >
                <select
                  value={historicalPeriod}
                  onChange={(e) => setHistoricalPeriod(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                >
                  {historicalOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </NumberField>
              <NumberField label="Growth Factor" hint="e.g. 1.10 = 10% growth">
                <input
                  type="number"
                  step={0.01}
                  value={growth}
                  onChange={(e) => setGrowth(Number(e.target.value) || 0)}
                  className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-[13px] num font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                />
              </NumberField>
            </div>
            <div className="mt-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-[12.5px] flex items-center gap-2">
              <Calculator className="size-3.5 text-primary shrink-0" />
              <span className="font-medium">Goal Contribution = Historical Sales × Growth Factor × Weight</span>
            </div>
          </ComponentCard>

          {/* Potential */}
          <ComponentCard
            accent="bg-chart-2"
            title="Territory Potential"
            description="Uses territory opportunity to influence goal allocation."
            weight={wPot}
            onWeightChange={setWPot}
          >
            <div className="text-[12.5px] text-muted-foreground leading-relaxed">
              Pulled from the <span className="font-medium text-foreground">Territory Potential</span> dataset for {period}.
              Sample territory potential value: <span className="num font-semibold text-foreground">${sample?.potential}K</span>.
            </div>
            <div className="mt-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-[12.5px] flex items-center gap-2">
              <Calculator className="size-3.5 text-primary shrink-0" />
              <span className="font-medium">Goal Contribution = Territory Potential × Weight</span>
            </div>
          </ComponentCard>

          {/* Equal Distribution */}
          <ComponentCard
            accent="bg-chart-3"
            title="Equal Distribution"
            description="National target divided equally across the rep population."
            weight={wEqual}
            onWeightChange={setWEqual}
          >
            <div className="grid grid-cols-3 gap-3 text-[12.5px]">
              <Stat label="National Target" value={`$${NATIONAL_TARGET_K.toLocaleString()}`} />
              <Stat label="# of Reps" value={REP_COUNT.toLocaleString()} />
              <Stat label="Equal Share" value={`$${Math.round(equalShare).toLocaleString()}`} />
            </div>
            <div className="mt-4 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-[12.5px] flex items-center gap-2">
              <Calculator className="size-3.5 text-primary shrink-0" />
              <span className="font-medium">Goal Contribution = National Target ÷ # of Reps</span>
            </div>
          </ComponentCard>
        </div>

        {/* Weight Total + Actions */}
        <div className="flex flex-col gap-4">
          <div
            className={`rounded-xl border px-5 py-4 ${
              balanced ? "border-success/30 bg-success/10" : "border-warning/40 bg-warning/10"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`size-8 rounded-full grid place-items-center text-sm font-bold ${
                  balanced ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
                }`}>
                  {balanced ? "✓" : "!"}
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium">
                    Weight Total
                  </span>
                  <div className="text-[14px] font-semibold num">
                    {total}% {balanced ? "" : `(${total > 100 ? "+" : ""}${total - 100})`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Weight distribution bars */}
                <div className="hidden md:flex items-center gap-1.5 w-48">
                  <div
                    className="h-2 rounded-full bg-chart-1 transition-all duration-300"
                    style={{ width: `${wHist}%` }}
                  />
                  <div
                    className="h-2 rounded-full bg-chart-2 transition-all duration-300"
                    style={{ width: `${wPot}%` }}
                  />
                  <div
                    className="h-2 rounded-full bg-chart-3 transition-all duration-300"
                    style={{ width: `${wEqual}%` }}
                  />
                </div>
                <span className={`text-[13px] font-semibold ${balanced ? "text-success" : "text-warning"}`}>
                  {balanced ? "Balanced" : "Unbalanced"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold border border-border bg-background hover:bg-muted transition-colors"
            >
              <Eye className="size-3.5" />
              Goal Preview
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className={`h-9 px-5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold shadow-card transition-colors ${
                balanced ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              disabled={!balanced}
            >
              Continue to Fairness Testing
            </button>
          </div>
        </div>

        {/* Preview modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <Card className="max-w-5xl w-full p-0 max-h-[85vh] flex flex-col">
              <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold tracking-tight">Rep-Level Goal Preview</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    First {REPS.length} of {REP_COUNT.toLocaleString()} reps · live recompute
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="primary">Live</Badge>
                  <button onClick={() => setShowPreview(false)} className="size-7 grid place-items-center rounded-md hover:bg-muted">
                    <X className="size-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground bg-muted/40">
                      <th className="text-left font-medium px-5 py-2.5">Rep</th>
                      <th className="text-left font-medium px-5 py-2.5">Geo ID</th>
                      <th className="text-right font-medium px-5 py-2.5">Historical Sales</th>
                      <th className="text-right font-medium px-5 py-2.5">Territory Potential</th>
                      <th className="text-right font-medium px-5 py-2.5">Equal Distribution</th>
                      <th className="text-right font-medium px-5 py-2.5 pr-6">Final Goal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.map((r) => (
                      <tr key={r.rep} className="hover:bg-muted/30">
                        <td className="px-5 py-3 font-medium">{r.rep}</td>
                        <td className="px-5 py-3"><Badge tone="neutral">GEO-{r.region}</Badge></td>
                        <td className="px-5 py-3 text-right num text-muted-foreground">${r.histContrib}K</td>
                        <td className="px-5 py-3 text-right num text-muted-foreground">${r.potContrib}K</td>
                        <td className="px-5 py-3 text-right num text-muted-foreground">${r.eqContrib.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right num font-semibold pr-6">${r.goal}K</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {showInvalid && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full p-0">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-warning/15 text-warning grid place-items-center">
                <AlertTriangle className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold">Weights must total 100%</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  Currently {total}%.
                </div>
              </div>
              <button onClick={() => setShowInvalid(false)} className="size-7 grid place-items-center rounded-md hover:bg-muted">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 text-[12.5px] text-muted-foreground">
              Adjust the three component weights so they sum to exactly 100% before continuing.
            </div>
            <div className="px-5 pb-4 flex justify-end">
              <button onClick={() => setShowInvalid(false)} className="h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90">
                Got it
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ComponentCard({
  accent, title, description, weight, onWeightChange, children,
}: {
  accent: string; title: string; description: string; weight: number;
  onWeightChange: (n: number) => void; children: React.ReactNode;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className={`h-1 ${accent}`} />
      <div className="px-5 pt-5 pb-3 border-b border-border flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold tracking-tight">{title}</div>
          <div className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{description}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium">Weight</span>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              value={weight}
              onChange={(e) => onWeightChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              className="w-20 h-9 pr-6 pl-2.5 rounded-md border border-border bg-background text-[13px] num font-semibold text-right focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">%</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </Card>
  );
}

function NumberField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1.5">{label}</div>
      {children}
      {hint && <div className="mt-1.5 text-[11px] text-muted-foreground">{hint}</div>}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2.5">
      <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium">{label}</div>
      <div className="text-[14px] font-semibold num mt-0.5">{value}</div>
    </div>
  );
}
