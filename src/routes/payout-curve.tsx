import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import { Plus, Trash2, Save, Info } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";

export const Route = createFileRoute("/payout-curve")({
  head: () => ({
    meta: [
      { title: "Payout Curve · IC Design" },
      {
        name: "description",
        content: "Define payout inflexion points with direct numeric inputs — no slider clamping.",
      },
    ],
  }),
  component: PayoutCurve,
});

type Point = { id: string; name: string; attainment: number; payout: number };

const DEFAULT_POINTS: Point[] = [
  { id: "p1", name: "Threshold", attainment: 80, payout: 50 },
  { id: "p2", name: "Target", attainment: 100, payout: 100 },
  { id: "p3", name: "Excellence", attainment: 120, payout: 150 },
  { id: "p4", name: "Stretch", attainment: 150, payout: 200 },
];


const PALETTE = [
  "var(--warning)",
  "var(--primary)",
  "var(--info)",
  "var(--chart-4)",
  "var(--destructive)",
  "var(--chart-2)",
  "var(--chart-5)",
];

function buildCurve(points: Point[]) {
  // Sort by attainment for interpolation
  const sorted = [...points].sort((a, b) => a.attainment - b.attainment);
  if (sorted.length === 0) return [];
  const min = Math.min(0, sorted[0].attainment);
  const max = Math.max(200, sorted[sorted.length - 1].attainment);
  const data: { x: number; payout: number }[] = [];
  for (let x = min; x <= max; x += 2) {
    let payout = 0;
    if (x <= sorted[0].attainment) payout = sorted[0].payout;
    else if (x >= sorted[sorted.length - 1].attainment)
      payout = sorted[sorted.length - 1].payout;
    else {
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (x >= a.attainment && x <= b.attainment) {
          const t = (x - a.attainment) / (b.attainment - a.attainment || 1);
          payout = a.payout + t * (b.payout - a.payout);
          break;
        }
      }
    }
    data.push({ x, payout: Math.round(payout * 10) / 10 });
  }
  return data;
}

function PayoutCurve() {
  const [points, setPoints] = useState<Point[]>(DEFAULT_POINTS);
  const [library, setLibrary] = useState<SavedCurve[]>(CURVE_PRESETS);
  const [activeCurveId, setActiveCurveId] = useState<string>("preset-standard");
  const [showSave, setShowSave] = useState(false);
  const [curveName, setCurveName] = useState("");

  useEffect(() => {
    setLibrary(loadCurveLibrary());
  }, []);

  const applyCurve = (c: SavedCurve) => {
    setPoints(c.points.map((p, i) => ({ ...p, id: `${c.id}-${i}` })));
    setActiveCurveId(c.id);
  };

  const removeCurve = (id: string) => {
    deleteCurve(id);
    setLibrary(loadCurveLibrary());
  };

  const commitSave = () => {
    const name = curveName.trim() || `Custom Curve ${new Date().toLocaleDateString()}`;
    const saved = saveCurve(name, points);
    setLibrary(loadCurveLibrary());
    setActiveCurveId(saved.id);
    setCurveName("");
    setShowSave(false);
  };

  const update = (id: string, patch: Partial<Point>) =>
    setPoints((p) => p.map((pt) => (pt.id === id ? { ...pt, ...patch } : pt)));
  const remove = (id: string) => setPoints((p) => p.filter((pt) => pt.id !== id));
  const add = () => {
    const last = points[points.length - 1];
    setPoints((p) => [
      ...p,
      {
        id: `p${Date.now()}`,
        name: `Point ${p.length + 1}`,
        attainment: last ? last.attainment + 10 : 100,
        payout: last ? last.payout + 20 : 100,
      },
    ]);
  };

  const data = useMemo(() => buildCurve(points), [points]);
  const sortedPoints = useMemo(
    () => [...points].sort((a, b) => a.attainment - b.attainment),
    [points],
  );
  const xMax = Math.max(200, ...points.map((p) => p.attainment) , 0) + 10;
  const yMax = Math.max(200, ...points.map((p) => p.payout), 0) + 10;

  return (
    <div>
      <PageHeader
        step={5}
        title="Payout Curve Designer"
        prev={{ to: "/fairness", label: "Fairness Testing" }}
        next={{ to: "/simulation", label: "Monte Carlo" }}
        actions={
          <button
            onClick={() => { setCurveName(""); setShowSave(true); }}
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 shadow-card"
          >
            <Save className="size-3.5" /> Save to Curve Library
          </button>
        }
      />


      <div className="px-8 py-7 max-w-[1600px] grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6">
        {/* Chart */}
        <Card className="p-0">
          <div className="px-5 pt-5 pb-3 border-b border-border">
            <div className="text-[14px] font-semibold tracking-tight">Curve Preview</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              Line is interpolated between the inflexion points defined on the right.
            </div>
          </div>
          <div className="px-2 pt-4 pb-2" style={{ height: 480 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="payout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[0, xMax]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  label={{
                    value: "Attainment",
                    position: "bottom",
                    offset: -5,
                    fontSize: 11,
                    fill: "var(--muted-foreground)",
                  }}
                />
                <YAxis
                  type="number"
                  domain={[0, yMax]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  label={{
                    value: "Payout",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                    fill: "var(--muted-foreground)",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}% payout`, ""]}
                  labelFormatter={(l) => `${l}% attainment`}
                />
                <Area
                  type="monotone"
                  dataKey="payout"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#payout)"
                  dot={false}
                />
                {sortedPoints.map((p, i) => (
                  <ReferenceDot
                    key={p.id}
                    x={p.attainment}
                    y={p.payout}
                    r={6}
                    fill={PALETTE[i % PALETTE.length]}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Inflexion points editor */}
        <Card className="p-0">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
            <div>
              <div className="text-[14px] font-semibold tracking-tight">Inflexion Points</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Direct input — values above 100% are allowed.
              </div>
            </div>
            <button
              type="button"
              onClick={add}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90"
            >
              <Plus className="size-3.5" /> Add point
            </button>
          </div>

          <div className="px-5 py-2 grid grid-cols-[1fr_88px_88px_28px] gap-2 text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium border-b border-border">
            <span>Name</span>
            <span className="text-right">Attainment %</span>
            <span className="text-right">Payout %</span>
            <span />
          </div>

          <div className="divide-y divide-border">
            {points.map((p, i) => {
              const color = PALETTE[
                [...points].sort((a, b) => a.attainment - b.attainment).findIndex((x) => x.id === p.id) %
                  PALETTE.length
              ];
              return (
                <div
                  key={p.id}
                  className="px-5 py-2.5 grid grid-cols-[1fr_88px_88px_28px] gap-2 items-center"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2.5 rounded-sm shrink-0" style={{ background: color }} />
                    <input
                      value={p.name}
                      onChange={(e) => update(p.id, { name: e.target.value })}
                      className="w-full h-8 px-2 rounded border border-transparent bg-transparent text-[12.5px] font-medium hover:border-border focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                  <input
                    type="number"
                    value={p.attainment}
                    onChange={(e) => update(p.id, { attainment: Number(e.target.value) })}
                    className="h-8 px-2 rounded-md border border-border bg-background text-[12.5px] num font-semibold text-right focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                  />
                  <input
                    type="number"
                    value={p.payout}
                    onChange={(e) => update(p.id, { payout: Number(e.target.value) })}
                    className="h-8 px-2 rounded-md border border-border bg-background text-[12.5px] num font-semibold text-right focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    disabled={points.length <= 2}
                    className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:pointer-events-none"
                    title="Remove point"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3 border-t border-border flex items-start gap-2 text-[11.5px] text-muted-foreground">
            <Info className="size-3.5 mt-0.5 shrink-0" />
            Curve is linearly interpolated between points after sorting by attainment. No upper bound is enforced.
          </div>

          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <Badge tone="primary">{points.length} points</Badge>
            <Badge tone="neutral">Max payout: {Math.max(...points.map((p) => p.payout))}%</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
