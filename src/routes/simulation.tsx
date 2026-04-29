import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, Slider, SegmentedTabs } from "@/components/ui-kit";
import { Play, Activity, AlertTriangle, TrendingUp, ShieldCheck, Layers3, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "Monte Carlo Simulation · Helix IC" },
      { name: "description", content: "Run thousands of scenarios to validate goal fairness, payout risk, and budget exposure." },
    ],
  }),
  component: Simulation,
});

// Generate a normal-ish distribution for attainment
function gaussian(n: number, mean: number, sd: number) {
  const buckets = Array.from({ length: n }, (_, i) => {
    const x = 40 + (i / n) * 140; // 40% to 180%
    const y = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / sd) ** 2);
    return { x, y: y * 1000 };
  });
  return buckets;
}

const SCENARIOS = [
  { id: "base", name: "Base Case", color: "var(--chart-1)", mean: 102, sd: 18, prob: 62, budget: 66.5, hit: 58 },
  { id: "bull", name: "Bull · Strong Launch", color: "var(--chart-2)", mean: 114, sd: 16, prob: 22, budget: 71.2, hit: 71 },
  { id: "bear", name: "Bear · Payer Pressure", color: "var(--chart-3)", mean: 89, sd: 22, prob: 16, budget: 60.8, hit: 41 },
];

const RUN_PRESETS = [1000, 5000, 10000, 25000, 50000];

function Simulation() {
  const [variability, setVariability] = useState(18);
  const [runs, setRuns] = useState(10000);
  const [growth, setGrowth] = useState(15);
  const [view, setView] = useState<"distribution" | "scenarios">("distribution");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastRun, setLastRun] = useState<{ runs: number; durationMs: number; volatility: number; overrun: number; at: number }>({
    runs: 12000,
    durationMs: 4200,
    volatility: 0.21,
    overrun: 14,
    at: Date.now() - 2 * 60 * 60 * 1000,
  });

  // Derived summary outputs — deterministic preview from inputs
  const summary = useMemo(() => {
    const noise = Math.max(0.5, 1 - Math.log10(runs) / 5);
    const volatility = Math.min(0.6, (variability / 100) * 1.15 * noise);
    const overrun = Math.max(0, Math.min(95, Math.round((variability - 10) * 1.4 + growth * 0.4)));
    const ciHalf = +(variability / Math.sqrt(runs / 100)).toFixed(2);
    return { volatility: +volatility.toFixed(3), overrun, ciHalf };
  }, [variability, growth, runs]);

  const runSimulation = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    const start = performance.now();
    const totalMs = Math.min(2400, 200 + runs * 0.04);
    const tickMs = 60;
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += tickMs;
      const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(id);
        setRunning(false);
        setLastRun({
          runs,
          durationMs: Math.round(performance.now() - start),
          volatility: summary.volatility,
          overrun: summary.overrun,
          at: Date.now(),
        });
      }
    }, tickMs);
  };

  const distData = useMemo(() => gaussian(80, 102, variability), [variability]);

  return (
    <div>
      <PageHeader
        step={4}
        eyebrow="Decision Engine"
        title="Monte Carlo Simulation"
        description="Stress-test the plan across thousands of futures. Quantify goal fairness and payout volatility."
        prev={{ to: "/payout-curve", label: "Payout Curve" }}
        next={{ to: "/fairness", label: "Fairness Testing" }}
        actions={
          <button
            onClick={runSimulation}
            disabled={running}
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-success text-success-foreground text-[13px] font-semibold hover:opacity-90 shadow-card disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Play className="size-3.5" /> {running ? `Running… ${progress}%` : `Run ${runs.toLocaleString()} Simulations`}
          </button>
        }
      />
      <div className="px-8 py-7 max-w-[1600px] space-y-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiTile icon={ShieldCheck} tone="success" label="Reps Likely to Hit Target" value="61.4%" hint="Healthy · target 55–65%" />
          <KpiTile
            icon={Activity}
            tone="info"
            label="Payout Volatility (CV)"
            value={summary.volatility.toFixed(2)}
            hint={`±${summary.ciHalf}% CI · n=${runs.toLocaleString()}`}
          />
          <KpiTile icon={TrendingUp} tone="primary" label="P90 Payout / Rep" value="$48.2K" hint="P10: $14.6K · P50: $28.1K" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5">
          {/* Setup */}
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
              <div className="text-[14px] font-semibold tracking-tight">Scenario Setup</div>
              <Badge tone="success"><span className="size-1.5 rounded-full bg-success animate-pulse" /> Live</Badge>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-[12px] font-medium">Performance Variability (σ)</label>
                  <span className="text-[14px] font-semibold num">{variability}%</span>
                </div>
                <Slider value={variability} onChange={setVariability} min={5} max={40} />
                <div className="text-[11px] text-muted-foreground mt-1">Higher σ → wider attainment spread</div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-[12px] font-medium">Growth Assumption</label>
                  <span className="text-[14px] font-semibold num">+{growth}%</span>
                </div>
                <Slider value={growth} onChange={setGrowth} max={40} />
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-[12px] font-medium">Number of Simulations</label>
                  <span className="text-[14px] font-semibold num">{runs.toLocaleString()}</span>
                </div>
                <Slider value={runs} onChange={setRuns} min={1000} max={50000} step={1000} />
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {RUN_PRESETS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setRuns(n)}
                      className={`h-7 rounded-md text-[11px] font-medium border transition-colors ${
                        runs === n
                          ? "border-primary bg-primary-muted text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {n >= 1000 ? `${n / 1000}k` : n}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 text-[10.5px] text-muted-foreground">
                  Larger n → tighter CI (±{summary.ciHalf}%) · longer runtime
                </div>
              </div>

              <button
                onClick={runSimulation}
                disabled={running}
                className="w-full h-10 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 shadow-card inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <Play className="size-3.5" />
                {running ? `Running… ${progress}%` : `Run ${runs.toLocaleString()} Simulations`}
              </button>

              {running && (
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}

              <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1.5">
                <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium">Last Run · Summary Outputs</div>
                <div className="text-[12.5px] num">{lastRun.runs.toLocaleString()} simulations · {(lastRun.durationMs / 1000).toFixed(1)}s</div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="rounded-md bg-background border border-border px-2 py-1.5">
                    <div className="text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">Volatility</div>
                    <div className="text-[13px] font-semibold num">{lastRun.volatility.toFixed(2)}</div>
                  </div>
                  <div className="rounded-md bg-background border border-border px-2 py-1.5">
                    <div className="text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">Overrun P</div>
                    <div className={`text-[13px] font-semibold num ${lastRun.overrun > 20 ? "text-warning-foreground" : "text-success"}`}>
                      {lastRun.overrun}%
                    </div>
                  </div>
                </div>
                <button className="mt-1 w-full h-8 rounded-md border border-border bg-background text-[12px] font-medium hover:bg-muted inline-flex items-center justify-center gap-1.5">
                  <RefreshCw className="size-3" /> View previous runs
                </button>
              </div>
            </div>
          </Card>

          {/* Main viz */}
          <div className="space-y-5">
            <Card className="p-0">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
                <div>
                  <div className="text-[14px] font-semibold tracking-tight">Attainment Distribution Curve</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">Density of {runs.toLocaleString()} simulated rep outcomes</div>
                </div>
                <SegmentedTabs
                  value={view}
                  onChange={setView}
                  options={[
                    { value: "distribution", label: "Distribution" },
                    { value: "scenarios", label: "Scenarios" },
                  ]}
                />
              </div>
              <div className="px-2 pt-4 pb-2 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={distData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="dist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="x" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${(v as number).toFixed(1)}`, "density"]} labelFormatter={(l) => `${(l as number).toFixed(0)}% attainment`} />
                    <ReferenceLine x={80} stroke="var(--warning)" strokeDasharray="4 4" label={{ value: "Threshold 80%", fontSize: 10, fill: "var(--warning)", position: "top" }} />
                    <ReferenceLine x={100} stroke="var(--primary)" strokeWidth={1.5} label={{ value: "Target 100%", fontSize: 10, fill: "var(--primary)", position: "top" }} />
                    <ReferenceLine x={130} stroke="var(--success)" strokeDasharray="4 4" label={{ value: "Super Acc 130%", fontSize: 10, fill: "var(--success)", position: "top" }} />
                    <ReferenceLine x={150} stroke="var(--destructive)" strokeDasharray="4 4" label={{ value: "Cap 150%", fontSize: 10, fill: "var(--destructive)", position: "top" }} />
                    <Area type="monotone" dataKey="y" stroke="var(--chart-1)" strokeWidth={2} fill="url(#dist)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="px-5 pb-5 grid grid-cols-4 gap-3 border-t border-border pt-4">
                <Pill label="P10" value="68%" />
                <Pill label="P50 (Median)" value="102%" tone="primary" />
                <Pill label="P90" value="138%" />
                <Pill label="Std Dev" value={`${variability}%`} />
              </div>
            </Card>

            {/* Scenario comparison */}
            <Card className="p-0">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
                <div>
                  <div className="text-[14px] font-semibold tracking-tight">Scenario Comparison</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">Probability-weighted forward outcomes</div>
                </div>
                <Badge tone="primary"><Layers3 className="size-3" /> 3 scenarios</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                {SCENARIOS.map((s) => (
                  <div key={s.id} className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
                        <div className="text-[13px] font-semibold">{s.name}</div>
                      </div>
                      <Badge tone="neutral">{s.prob}% likely</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground font-medium">Mean Att.</div>
                        <div className="text-[18px] font-semibold num mt-0.5">{s.mean}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground font-medium">Budget</div>
                        <div className="text-[18px] font-semibold num mt-0.5">${s.budget}M</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground font-medium">% Hit</div>
                        <div className="text-[18px] font-semibold num mt-0.5">{s.hit}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiTile({ icon: Icon, tone, label, value, hint }: any) {
  const map = {
    success: { bg: "bg-success/10", text: "text-success" },
    warning: { bg: "bg-warning/15", text: "text-warning-foreground" },
    info: { bg: "bg-info/10", text: "text-info" },
    primary: { bg: "bg-primary-muted", text: "text-primary" },
  } as any;
  const c = map[tone];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground font-medium">{label}</div>
          <div className="mt-1 text-[24px] font-semibold tracking-tight num">{value}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>
        </div>
        <div className={`size-9 rounded-lg grid place-items-center ${c.bg}`}>
          <Icon className={`size-4 ${c.text}`} />
        </div>
      </div>
    </Card>
  );
}

function Pill({ label, value, tone }: { label: string; value: string; tone?: "primary" }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${tone === "primary" ? "border-primary/30 bg-primary-muted/40" : "border-border bg-muted/30"}`}>
      <div className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground font-medium">{label}</div>
      <div className="text-[14px] font-semibold num">{value}</div>
    </div>
  );
}
