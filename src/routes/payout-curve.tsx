import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, Slider } from "@/components/ui-kit";
import { GitCompareArrows, Save, Zap, TrendingUp, Move } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
} from "recharts";

export const Route = createFileRoute("/payout-curve")({
  head: () => ({
    meta: [
      { title: "Payout Curve Designer · Helix IC" },
      { name: "description", content: "Design payout thresholds, accelerators and caps with live curve preview." },
    ],
  }),
  component: PayoutCurve,
});

function buildCurve(t: number, target: number, acc: number, sup: number, cap: number) {
  // returns array of { x: attainment, payout: % }
  const out: { x: number; payout: number; baseline: number }[] = [];
  for (let x = 0; x <= 200; x += 2) {
    let p = 0;
    if (x < t) p = 0;
    else if (x <= target) p = ((x - t) / (target - t)) * 100;
    else if (x <= acc) p = 100 + ((x - target) / (acc - target)) * 20; // 100→120
    else if (x <= sup) p = 120 + ((x - acc) / (sup - acc)) * 50; // 120→170
    else if (x <= cap) p = 170 + ((x - sup) / (cap - sup)) * 30; // 170→200
    else p = 200;
    // baseline = simple linear from threshold to cap
    let b = 0;
    if (x >= t && x <= cap) b = ((x - t) / (cap - t)) * 200;
    else if (x > cap) b = 200;
    out.push({ x, payout: Math.round(p * 10) / 10, baseline: Math.round(b * 10) / 10 });
  }
  return out;
}

// Chart geometry — must match AreaChart margin below
const CHART_LEFT = 50;   // left margin (incl. y-axis label & ticks ≈ 10 + 40)
const CHART_RIGHT = 40;
const CHART_TOP = 20;
const CHART_BOTTOM = 30;
const CHART_HEIGHT = 420;
const X_MIN = 0;
const X_MAX = 200;
const Y_MAX = 200;

function PayoutCurve() {
  const [t, setT] = useState(80);
  const [target] = useState(100);
  const [acc, setAcc] = useState(110);
  const [sup, setSup] = useState(130);
  const [cap, setCap] = useState(150);
  const [showBaseline, setShowBaseline] = useState(true);
  const [dragging, setDragging] = useState<null | "t" | "acc" | "sup" | "cap">(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => buildCurve(t, target, acc, sup, cap), [t, target, acc, sup, cap]);

  // Convert attainment % → pixel x within the plot area
  const xToPx = (pct: number, plotW: number) =>
    CHART_LEFT + ((pct - X_MIN) / (X_MAX - X_MIN)) * plotW;
  // Convert payout % → pixel y within the plot area (inverted)
  const yToPx = (payout: number, plotH: number) =>
    CHART_TOP + (1 - payout / Y_MAX) * plotH;

  // Find payout at a given attainment from the curve data
  const payoutAt = (x: number) => {
    const row = data.find((d) => d.x >= x);
    return row?.payout ?? 0;
  };

  // Drag clamps per handle so points cannot cross each other
  const clampFor = (key: "t" | "acc" | "sup" | "cap", v: number) => {
    if (key === "t") return Math.max(50, Math.min(95, v));
    if (key === "acc") return Math.max(101, Math.min(sup - 2, v));
    if (key === "sup") return Math.max(acc + 2, Math.min(cap - 2, v));
    return Math.max(sup + 2, Math.min(200, v)); // cap
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const plotW = rect.width - CHART_LEFT - CHART_RIGHT;
    const px = e.clientX - rect.left - CHART_LEFT;
    const pct = Math.round((px / plotW) * (X_MAX - X_MIN) + X_MIN);
    const v = clampFor(dragging, pct);
    if (dragging === "t") setT(v);
    else if (dragging === "acc") setAcc(v);
    else if (dragging === "sup") setSup(v);
    else setCap(v);
  };

  const endDrag = () => setDragging(null);

  const previews = [85, 100, 115, 135, 150].map((x) => ({ x, payout: payoutAt(x) }));

  return (
    <div>
      <PageHeader
        step={4}
        title="Payout Curve Designer"
        description="Sculpt the payout schedule. Drag inflection points to balance motivation, fairness and budget."
        prev={{ to: "/simulation", label: "Monte Carlo" }}
        next={{ to: "/fairness", label: "Fairness Testing" }}
        actions={
          <button className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 shadow-card">
            <Save className="size-3.5" /> Save Curve
          </button>
        }
      />
      <div className="px-8 py-7 max-w-[1600px] grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
              <div>
                <div className="text-[14px] font-semibold tracking-tight">Interactive Payout Curve</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">Sales Rep · Product A — Onclera</div>
              </div>
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={showBaseline} onChange={(e) => setShowBaseline(e.target.checked)} className="accent-primary" />
                Compare to FY25 curve
              </label>
            </div>
            <div className="px-2 pt-5 pb-2 h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 40, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="payout" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="x" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} label={{ value: "Attainment", position: "bottom", offset: -5, fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} label={{ value: "Payout", angle: -90, position: "insideLeft", fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => [`${v}% payout`, ""]}
                    labelFormatter={(l) => `${l}% attainment`}
                  />
                  {showBaseline && <Line type="monotone" dataKey="baseline" stroke="var(--muted-foreground)" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />}
                  <Area type="monotone" dataKey="payout" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#payout)" dot={false} />
                  <ReferenceLine x={t} stroke="var(--warning)" strokeDasharray="3 3" />
                  <ReferenceLine x={target} stroke="var(--primary)" strokeWidth={1.5} />
                  <ReferenceLine x={acc} stroke="var(--info)" strokeDasharray="3 3" />
                  <ReferenceLine x={sup} stroke="var(--chart-4)" strokeDasharray="3 3" />
                  <ReferenceLine x={cap} stroke="var(--destructive)" strokeDasharray="3 3" />
                  <ReferenceDot x={t} y={0} r={6} fill="var(--warning)" stroke="var(--surface)" strokeWidth={2} />
                  <ReferenceDot x={target} y={100} r={7} fill="var(--primary)" stroke="var(--surface)" strokeWidth={2} />
                  <ReferenceDot x={acc} y={120} r={6} fill="var(--info)" stroke="var(--surface)" strokeWidth={2} />
                  <ReferenceDot x={sup} y={170} r={6} fill="var(--chart-4)" stroke="var(--surface)" strokeWidth={2} />
                  <ReferenceDot x={cap} y={200} r={6} fill="var(--destructive)" stroke="var(--surface)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="px-5 pb-5 pt-2 grid grid-cols-5 gap-2 border-t border-border">
              <Inflection color="var(--warning)" label="Threshold" value={`${t}%`} payout="0%" />
              <Inflection color="var(--primary)" label="Target" value={`${target}%`} payout="100%" />
              <Inflection color="var(--info)" label="Accelerator" value={`${acc}%`} payout="120%" />
              <Inflection color="var(--chart-4)" label="Super Acc." value={`${sup}%`} payout="170%" />
              <Inflection color="var(--destructive)" label="Cap" value={`${cap}%`} payout="200%" />
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <div className="text-[14px] font-semibold tracking-tight">Live Payout Preview</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Sample attainments → resulting payout %</div>
            </div>
            <div className="grid grid-cols-5 divide-x divide-border">
              {previews.map((p) => (
                <div key={p.x} className="p-5 text-center">
                  <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium">Attainment</div>
                  <div className="text-[20px] font-semibold tracking-tight num mt-0.5">{p.x}%</div>
                  <div className="my-2 mx-auto w-8 h-px bg-border" />
                  <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium">Payout</div>
                  <div className={`text-[22px] font-semibold tracking-tight num mt-0.5 ${p.payout >= 100 ? "text-success" : p.payout > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {p.payout.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <div className="text-[14px] font-semibold tracking-tight">Inflection Editor</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Drag sliders or type values</div>
            </div>
            <div className="p-5 space-y-5">
              <PointSlider color="var(--warning)" label="Threshold" value={t} onChange={setT} min={50} max={95} />
              <PointSlider color="var(--info)" label="Accelerator" value={acc} onChange={setAcc} min={101} max={125} />
              <PointSlider color="var(--chart-4)" label="Super Accelerator" value={sup} onChange={setSup} min={120} max={145} />
              <PointSlider color="var(--destructive)" label="Cap" value={cap} onChange={setCap} min={130} max={200} />
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                <GitCompareArrows className="size-3.5" /> Curve Library
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Apply preset or save current</div>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { n: "FY25 Plan (live)", t: "80/100/110/130/150", active: false },
                { n: "Aggressive Launch", t: "75/100/105/120/175", active: false },
                { n: "Conservative", t: "85/100/115/135/140", active: false },
                { n: "Current Draft", t: `${t}/${target}/${acc}/${sup}/${cap}`, active: true },
              ].map((c) => (
                <div key={c.n} className={`p-3 rounded-md border ${c.active ? "border-primary/30 bg-primary-muted/30" : "border-border hover:bg-muted/40"}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-[12.5px] font-medium">{c.n}</div>
                    {c.active && <Badge tone="primary">Active</Badge>}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 num">{c.t}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium mb-3">Curve Diagnostics</div>
            <div className="space-y-2.5">
              <Diag icon={Zap} label="Slope steepness" value="Moderate" tone="success" />
              <Diag icon={TrendingUp} label="Avg payout @ 100%" value="100% (1×)" tone="success" />
              <Diag icon={Zap} label="Cap exposure" value={`${(cap - 100)}% upside`} tone="info" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PointSlider({ color, label, value, onChange, min, max }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: color }} />
          <label className="text-[12px] font-medium">{label}</label>
        </div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 h-7 rounded-md border border-border bg-background px-2 text-[12.5px] num font-medium text-right"
        />
      </div>
      <Slider value={value} onChange={onChange} min={min} max={max} trackClass="" />
    </div>
  );
}

function Inflection({ color, label, value, payout }: any) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="size-2 rounded-sm" style={{ background: color }} />
        <span className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="text-[16px] font-semibold num">{value}</div>
      <div className="text-[11px] text-muted-foreground num">→ {payout}</div>
    </div>
  );
}

function Diag({ icon: Icon, label, value, tone }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}
