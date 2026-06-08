import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import { Sparkles, AlertCircle, AlertTriangle, X, Calendar } from "lucide-react";

export const Route = createFileRoute("/goal-setting")({
  head: () => ({
    meta: [
      { title: "Goal Setting · IC Design" },
      {
        name: "description",
        content:
          "Set rep / territory goals with weighted Historical, Potential and Equal-Distribution components.",
      },
    ],
  }),
  component: GoalSetting,
});

type HistoricalPeriod = "py_full" | "py_same_q" | "last_4q" | "custom";

const PERIOD_OPTIONS: { value: HistoricalPeriod; label: string; hint: string }[] = [
  { value: "py_full", label: "Previous Year (Full)", hint: "FY25 full year actuals" },
  { value: "py_same_q", label: "Prior Year · Same Quarter", hint: "Aligns to seasonality" },
  { value: "last_4q", label: "Last 4 Quarters (Rolling)", hint: "Most recent 4Q rolling" },
  { value: "custom", label: "Custom Range", hint: "Pick any date range" },
];

const REP_BASE = [
  { rep: "A. Kapoor", region: "NE", lyActuals: 1240, potential: 1620 },
  { rep: "M. Chen", region: "W", lyActuals: 980, potential: 1480 },
  { rep: "R. Patel", region: "SW", lyActuals: 1480, potential: 1720 },
  { rep: "J. Williams", region: "SE", lyActuals: 1120, potential: 1380 },
  { rep: "T. Nakamura", region: "MW", lyActuals: 1360, potential: 1540 },
  { rep: "L. García", region: "W", lyActuals: 890, potential: 1340 },
];
const NATIONAL_TARGET = 1_420_000; // $K — used for Equal Distribution
const REP_COUNT = 1247;

function GoalSetting() {
  const navigate = useNavigate();
  const [wHist, setWHist] = useState(50);
  const [wPot, setWPot] = useState(30);
  const [wEqual, setWEqual] = useState(20);
  const [growth, setGrowth] = useState(15);
  const [period, setPeriod] = useState<HistoricalPeriod>("py_full");
  const [showInvalid, setShowInvalid] = useState(false);

  const total = wHist + wPot + wEqual;
  const balanced = total === 100;
  const equalShare = NATIONAL_TARGET / REP_COUNT; // $K per rep

  const preview = useMemo(() => {
    return REP_BASE.map((r) => {
      const hist = r.lyActuals * (1 + growth / 100);
      const pot = r.potential * 0.88; // assumed achievable share of potential
      const eq = equalShare;
      const goal = (hist * wHist + pot * wPot + eq * wEqual) / 100;
      return { ...r, hist: Math.round(hist), pot: Math.round(pot), eq: Math.round(eq), goal: Math.round(goal) };
    });
  }, [wHist, wPot, wEqual, growth, equalShare]);

  const handleContinue = () => {
    if (!balanced) {
      setShowInvalid(true);
      return;
    }
    navigate({ to: "/payout-curve" });
  };

  return (
    <div>
      <PageHeader
        step={2}
        title="Goal Setting"
        description="Allocate weights across the three goal components, choose the historical window, then review differentiated rep-level targets."
        prev={{ to: "/plan-builder", label: "Plan Builder" }}
        actions={
          <button
            type="button"
            onClick={handleContinue}
            className={`h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold shadow-card ${
              balanced
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Continue to Payout Curve
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
              <div className="text-[13px] font-semibold">Blended (3-Component) Methodology</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Goal = (Historical × W₁) + (Potential × W₂) + (Equal Distribution × W₃). Any split allowed; weights must sum to 100%.
              </div>
            </div>
            <Badge tone={balanced ? "success" : "warning"}>
              {balanced ? "Balanced" : `Sums to ${total}%`}
            </Badge>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5">
          {/* Calibration */}
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <div className="text-[14px] font-semibold tracking-tight">Component Weights</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Type any percentages — no auto-rebalance. Must total 100%.
              </div>
            </div>
            <div className="p-5 space-y-4">
              <WeightRow
                label="Historical Component"
                hint="Past sales × growth factor"
                value={wHist}
                onChange={setWHist}
                accent="var(--chart-1)"
              />
              <WeightRow
                label="Potential Component"
                hint="Territory potential share"
                value={wPot}
                onChange={setWPot}
                accent="var(--chart-2)"
              />
              <WeightRow
                label="Equal Distribution Component"
                hint="National target ÷ headcount"
                value={wEqual}
                onChange={setWEqual}
                accent="var(--chart-3)"
              />

              <div
                className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                  balanced
                    ? "border-success/30 bg-success/10"
                    : "border-warning/40 bg-warning/10"
                }`}
              >
                <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium">
                  Weight total
                </span>
                <span className="text-[14px] font-semibold num">
                  {total}% {balanced ? "✓" : `(${total > 100 ? "+" : ""}${total - 100})`}
                </span>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
                  <Calendar className="size-3" /> Historical Period
                </div>
                <div className="space-y-1">
                  {PERIOD_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-2.5 p-2.5 rounded-md cursor-pointer border ${
                        period === opt.value
                          ? "border-primary/30 bg-primary-muted/30"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="period"
                        checked={period === opt.value}
                        onChange={() => setPeriod(opt.value)}
                        className="mt-0.5 accent-primary"
                      />
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium">{opt.label}</div>
                        <div className="text-[11px] text-muted-foreground">{opt.hint}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="text-[12px] font-medium">Growth Factor (applied to Historical)</label>
                  <span className="text-[14px] font-semibold num">+{growth}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={growth}
                  onChange={(e) => setGrowth(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="rounded-lg border border-info/30 bg-info/5 p-3 flex gap-2.5">
                <AlertCircle className="size-4 text-info shrink-0 mt-0.5" />
                <div className="text-[11.5px] text-foreground">
                  <span className="font-medium text-info">Tip:</span> Set any component to 0% to exclude it. Goals are computed per rep/territory and roll up to RM/AM.
                </div>
              </div>
            </div>
          </Card>

          {/* Target preview */}
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
              <div>
                <div className="text-[14px] font-semibold tracking-tight">Rep-Level Goal Preview</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  First 6 of {REP_COUNT.toLocaleString()} reps · differentiated per rep, never uniform
                </div>
              </div>
              <Badge tone="primary">Live recompute</Badge>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground bg-muted/40">
                  <th className="text-left font-medium px-5 py-2.5">Rep</th>
                  <th className="text-left font-medium px-5 py-2.5">Region</th>
                  <th className="text-right font-medium px-5 py-2.5">Historical</th>
                  <th className="text-right font-medium px-5 py-2.5">Potential</th>
                  <th className="text-right font-medium px-5 py-2.5">Equal</th>
                  <th className="text-right font-medium px-5 py-2.5 pr-6">Final Goal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {preview.map((r) => (
                  <tr key={r.rep} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{r.rep}</td>
                    <td className="px-5 py-3">
                      <Badge tone="neutral">{r.region}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right num text-muted-foreground">${r.hist}K</td>
                    <td className="px-5 py-3 text-right num text-muted-foreground">${r.pot}K</td>
                    <td className="px-5 py-3 text-right num text-muted-foreground">${r.eq}K</td>
                    <td className="px-5 py-3 text-right num font-semibold pr-6">${r.goal}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-border text-[11.5px] text-muted-foreground">
              RM and AM goals are derived as a roll-up of their direct reports' goals — not set independently.
            </div>
          </Card>
        </div>
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
                  Historical, Potential and Equal Distribution currently sum to {total}%.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInvalid(false)}
                className="size-7 grid place-items-center rounded-md hover:bg-muted"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 text-[12.5px] text-muted-foreground">
              Adjust any component up or down so the three weights add up to exactly 100% before continuing.
            </div>
            <div className="px-5 pb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInvalid(false)}
                className="h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90"
              >
                Got it
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function WeightRow({
  label,
  hint,
  value,
  onChange,
  accent,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: accent }} />
          <label className="text-[12.5px] font-medium">{label}</label>
        </div>
        <div className="relative flex items-center">
          <input
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
            className="w-20 h-8 pr-6 pl-2.5 rounded-md border border-border bg-background text-[13px] num font-semibold text-right focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
          />
          <span className="absolute right-2 text-[11px] text-muted-foreground pointer-events-none">%</span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
        style={{ accentColor: accent }}
      />
      <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}
