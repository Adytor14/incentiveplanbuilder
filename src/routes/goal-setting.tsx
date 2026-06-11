import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import { Info, AlertCircle, AlertTriangle, X, Calculator } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlanPeriod, PLAN_PERIODS, type PlanPeriod, previousQuarter } from "@/lib/plan-period";

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
  { rep: "A. Kapoor", region: "NE", historical: 1240, potential: 1620 },
  { rep: "M. Chen", region: "W", historical: 980, potential: 1480 },
  { rep: "R. Patel", region: "SW", historical: 1480, potential: 1720 },
  { rep: "J. Williams", region: "SE", historical: 1120, potential: 1380 },
  { rep: "T. Nakamura", region: "MW", historical: 1360, potential: 1540 },
  { rep: "L. García", region: "W", historical: 890, potential: 1340 },
];
const NATIONAL_TARGET_K = 1_420_000;
const REP_COUNT = 1247;

function GoalSetting() {
  const navigate = useNavigate();
  const { period } = usePlanPeriod();
  const [historicalPeriod, setHistoricalPeriod] = useState<PlanPeriod>(previousQuarter(period));
  const [growth, setGrowth] = useState<number>(1.10);
  const [wHist, setWHist] = useState(50);
  const [wPot, setWPot] = useState(30);
  const [wEqual, setWEqual] = useState(20);
  const [showInvalid, setShowInvalid] = useState(false);

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

  const territoryTotal = preview.reduce((s, r) => s + r.goal, 0);
  const sample = preview[0];

  const handleContinue = () => {
    if (!balanced) { setShowInvalid(true); return; }
    navigate({ to: "/fairness" });
  };

  return (
    <div>
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
      <div className="px-8 py-7 max-w-[1600px] space-y-6">
        <Card className="p-5 bg-primary-muted/30 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Sparkles className="size-4" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold">Blended Goal Methodology</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Goal = (Historical × W₁) + (Potential × W₂) + (Equal Distribution × W₃). Weights must sum to 100%.
              </div>
            </div>
            <Badge tone={balanced ? "success" : "warning"}>
              {balanced ? "Balanced" : `Sums to ${total}%`}
            </Badge>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-5">
          {/* Components */}
          <div className="space-y-4">
            {/* Historical */}
            <ComponentCard
              accent="var(--chart-1)"
              title="Historical Sales"
              description="Uses historical sales performance as the basis for goal creation."
              weight={wHist}
              onWeightChange={setWHist}
            >
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Historical Time Period"
                  hint={`Defaults to the quarter before ${period}.`}
                >
                  <select
                    value={historicalPeriod}
                    onChange={(e) => setHistoricalPeriod(e.target.value as PlanPeriod)}
                    className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                  >
                    {PLAN_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
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
              <div className="mt-3 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-[12.5px] flex items-center gap-2">
                <Calculator className="size-3.5 text-primary" />
                <span className="font-medium">Goal Contribution = Historical Sales × Growth Factor</span>
              </div>
            </ComponentCard>

            {/* Potential */}
            <ComponentCard
              accent="var(--chart-2)"
              title="Territory Potential"
              description="Uses territory opportunity to influence goal allocation."
              weight={wPot}
              onWeightChange={setWPot}
            >
              <div className="text-[12.5px] text-muted-foreground">
                Pulled from the <span className="font-medium text-foreground">Territory Potential</span> dataset for {period}.
                Sample territory potential value: <span className="num font-semibold text-foreground">${sample?.potential}K</span>.
              </div>
              <div className="mt-3 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-[12.5px] flex items-center gap-2">
                <Calculator className="size-3.5 text-primary" />
                <span className="font-medium">Goal Contribution = Territory Potential × Achievable Share</span>
              </div>
            </ComponentCard>

            {/* Equal Distribution */}
            <ComponentCard
              accent="var(--chart-3)"
              title="Equal Distribution"
              description="National target divided equally across the rep population."
              weight={wEqual}
              onWeightChange={setWEqual}
            >
              <div className="grid grid-cols-3 gap-3 text-[12.5px]">
                <Stat label="National Target" value={`$${(NATIONAL_TARGET_K / 1000).toLocaleString()}K`} />
                <Stat label="# of Reps" value={REP_COUNT.toLocaleString()} />
                <Stat label="Equal Share" value={`$${Math.round(equalShare).toLocaleString()}K`} />
              </div>
              <div className="mt-3 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-[12.5px] flex items-center gap-2">
                <Calculator className="size-3.5 text-primary" />
                <span className="font-medium">Goal Contribution = National Target ÷ # of Reps</span>
              </div>
            </ComponentCard>

            {/* Total */}
            <div
              className={`flex items-center justify-between rounded-md border px-4 py-3 ${
                balanced ? "border-success/30 bg-success/10" : "border-warning/40 bg-warning/10"
              }`}
            >
              <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium">
                Weight Total
              </span>
              <span className="text-[16px] font-semibold num">
                {total}% {balanced ? "✓" : `(${total > 100 ? "+" : ""}${total - 100})`}
              </span>
            </div>
          </div>

          {/* Live calculation panel */}
          <div className="space-y-4">
            <Card className="p-0 sticky top-20">
              <div className="px-5 pt-5 pb-3 border-b border-border">
                <div className="text-[13.5px] font-semibold tracking-tight">Rep-Level Goal Calculation</div>
              </div>
              <div className="px-5 py-4 space-y-2 text-[12.5px]">
                <CalcRow color="var(--chart-1)" label="Historical Contribution" value={`$${sample?.histContrib}K`} weight={wHist} />
                <CalcRow color="var(--chart-2)" label="Territory Potential Contribution" value={`$${sample?.potContrib}K`} weight={wPot} />
                <CalcRow color="var(--chart-3)" label="Equal Goal Contribution" value={`$${sample?.eqContrib}K`} weight={wEqual} />
                <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
                  <span className="text-[13px] font-semibold">Final Goal</span>
                  <span className="text-[18px] font-semibold num">${sample?.goal}K</span>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-border space-y-1.5 text-[12px]">
                <Roll label="Territory Goal Total (sample)" value={`$${territoryTotal.toLocaleString()}K`} />
                <Roll label="Region Goal Total" value={`$${(territoryTotal * 8).toLocaleString()}K`} />
                <Roll label="National Goal Total" value={`$${(NATIONAL_TARGET_K).toLocaleString()}K`} strong />
              </div>
            </Card>

            <div className="rounded-lg border border-info/30 bg-info/5 p-3 flex gap-2.5">
              <AlertCircle className="size-4 text-info shrink-0 mt-0.5" />
              <div className="text-[11.5px] text-foreground">
                <span className="font-medium text-info">Tip:</span> RM and AM goals are derived as a rollup of their direct reports — not set independently.
              </div>
            </div>
          </div>
        </div>

        {/* Preview table */}
        <Card className="p-0">
          <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold tracking-tight">Rep-Level Goal Preview</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                First {REPS.length} of {REP_COUNT.toLocaleString()} reps · live recompute
              </div>
            </div>
            <Badge tone="primary">Live</Badge>
          </div>
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
                  <td className="px-5 py-3 text-right num text-muted-foreground">${r.eqContrib}K</td>
                  <td className="px-5 py-3 text-right num font-semibold pr-6">${r.goal}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
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
    <Card className="p-0">
      <div className="px-5 pt-5 pb-3 border-b border-border flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="mt-1 size-3 rounded-sm shrink-0" style={{ background: accent }} />
          <div>
            <div className="text-[14px] font-semibold tracking-tight">{title}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">{description}</div>
          </div>
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
      <div className="px-5 py-4">{children}</div>
    </Card>
  );
}

function NumberField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">{label}</div>
      {children}
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium">{label}</div>
      <div className="text-[14px] font-semibold num">{value}</div>
    </div>
  );
}

function CalcRow({ color, label, value, weight }: { color: string; label: string; value: string; weight: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <span className="size-2 rounded-sm shrink-0" style={{ background: color }} />
        <span className="truncate">{label}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="num text-muted-foreground">{value}</span>
        <span className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium">× {weight}%</span>
      </div>
    </div>
  );
}

function Roll({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`num ${strong ? "font-semibold text-foreground text-[13px]" : ""}`}>{value}</span>
    </div>
  );
}
