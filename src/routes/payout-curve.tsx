import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ScopeStepper } from "@/components/ScopeStepper";
import { Card, Badge } from "@/components/ui-kit";
import { Plus, Trash2, Save, Info, Library, Check, X, Package, Users } from "lucide-react";
import { PRODUCTS, DEFAULT_PRODUCT_ID } from "@/lib/products";
import { ROLES, DEFAULT_ROLE_ID, scopeKey } from "@/lib/roles";
import {
  CURVE_PRESETS,
  loadCurveLibrary,
  saveCurve,
  deleteCurve,
  type SavedCurve,
} from "@/lib/curve-library";

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

// Each role + product combination starts from a distinct shape so the
// variation between curves is visible without any manual editing.
function scopeDefaults(roleId: string, productId: string): Point[] {
  const r = ROLES.findIndex((x) => x.id === roleId);
  const p = PRODUCTS.findIndex((x) => x.id === productId);
  const ri = r < 0 ? 0 : r;
  const pi = p < 0 ? 0 : p;

  // Managers get flatter thresholds (team roll-up) and richer upside.
  const threshold = 80 + ri * 3 - pi * 2; // 76 … 86
  const excellence = 115 + pi * 5; // 115 … 125
  const stretch = 145 + ri * 5 + pi * 3; // 145 … 161

  const thresholdPay = 40 + ri * 5 + pi * 5; // 40 … 60
  const excellencePay = 135 + ri * 15 + pi * 10; // 135 … 185
  const stretchPay = 180 + ri * 25 + pi * 15; // 180 … 260

  return [
    { id: "p1", name: "Threshold", attainment: threshold, payout: thresholdPay },
    { id: "p2", name: "Target", attainment: 100, payout: 100 },
    { id: "p3", name: "Excellence", attainment: excellence, payout: excellencePay },
    { id: "p4", name: "Stretch", attainment: stretch, payout: stretchPay },
  ];
}



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
  // Payout curve is defined per product.
  const [productId, setProductId] = useState<string>(DEFAULT_PRODUCT_ID);
  const [roleId, setRoleId] = useState<string>(DEFAULT_ROLE_ID);
  const scope = scopeKey(roleId, productId);
  const [pointsByScope, setPointsByScope] = useState<Record<string, Point[]>>(() =>
    Object.fromEntries(
      ROLES.flatMap((r) =>
        PRODUCTS.map((p) => [
          scopeKey(r.id, p.id),
          scopeDefaults(r.id, p.id).map((pt) => ({ ...pt, id: `${r.id}-${p.id}-${pt.id}` })),
        ]),
      ),
    ),
  );
  const points = pointsByScope[scope] ?? DEFAULT_POINTS;
  const setPoints = (updater: Point[] | ((prev: Point[]) => Point[])) =>
    setPointsByScope((prev) => ({
      ...prev,
      [scope]: typeof updater === "function" ? (updater as (p: Point[]) => Point[])(prev[scope]) : updater,
    }));
  const [library, setLibrary] = useState<SavedCurve[]>(CURVE_PRESETS);
  const [activeCurveByScope, setActiveCurveByScope] = useState<Record<string, string>>(() =>
    Object.fromEntries(ROLES.flatMap((r) => PRODUCTS.map((p) => [scopeKey(r.id, p.id), "preset-standard"]))),
  );
  const activeCurveId = activeCurveByScope[scope];
  const setActiveCurveId = (id: string) =>
    setActiveCurveByScope((prev) => ({ ...prev, [scope]: id }));
  const [showSave, setShowSave] = useState(false);
  const [curveName, setCurveName] = useState("");

  useEffect(() => {
    setLibrary(loadCurveLibrary());
  }, []);

  const applyCurve = (c: SavedCurve) => {
    setPoints(c.points.map((p, i) => ({ ...p, id: `${scope}-${c.id}-${i}` })));
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

      <div className="px-8 pt-4 max-w-[1600px]">
        <ScopeStepper
          roleId={roleId}
          productId={productId}
          onRoleChange={setRoleId}
          onProductChange={setProductId}
        />
      </div>


      <div className="px-8 py-7 max-w-[1600px] grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6">
        {/* Chart */}
        <Card className="p-0">
          <div className="px-5 pt-5 pb-3 border-b border-border">
            <div className="text-[14px] font-semibold tracking-tight">Curve Preview · {ROLES.find((r) => r.id === roleId)?.short} · {PRODUCTS.find((p) => p.id === productId)?.name}</div>
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

        {/* Curve Library */}
        <Card className="p-0 xl:col-span-2">
          <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between gap-3">
            <div>
              <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                <Library className="size-3.5 text-primary" /> Curve Library
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Standard templates and curves you have saved. Load one to start from it.
              </div>
            </div>
            <Badge tone="neutral">{library.length} curves</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
            {library.map((c) => {
              const active = c.id === activeCurveId;
              return (
                <div
                  key={c.id}
                  className={`rounded-lg border p-3.5 transition-colors ${
                    active ? "border-primary bg-primary-muted/40" : "border-border bg-background hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold truncate flex items-center gap-1.5">
                        {c.name}
                        {active && <Check className="size-3.5 text-primary shrink-0" />}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground mt-0.5">{c.description}</div>
                    </div>
                    <Badge tone={c.preset ? "neutral" : "primary"}>{c.preset ? "Preset" : "Saved"}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => applyCurve(c)}
                      className="h-8 px-2.5 rounded-md border border-border bg-background text-[12px] font-medium hover:bg-muted"
                    >
                      Load curve
                    </button>
                    {!c.preset && (
                      <button
                        onClick={() => removeCurve(c.id)}
                        className="size-8 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete curve"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {showSave && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full p-0">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-primary-muted text-primary grid place-items-center">
                <Save className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold">Save to Curve Library</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  {points.length} inflexion points will be stored as a reusable template.
                </div>
              </div>
              <button onClick={() => setShowSave(false)} className="size-7 grid place-items-center rounded-md hover:bg-muted">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">Curve Name</div>
              <input
                value={curveName}
                onChange={(e) => setCurveName(e.target.value)}
                placeholder="e.g. Q2 2026 Rep Curve"
                className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
              />
            </div>
            <div className="px-5 pb-4 flex justify-end gap-2">
              <button onClick={() => setShowSave(false)} className="h-9 px-3.5 rounded-md border border-border bg-background text-[13px] font-medium hover:bg-muted">Cancel</button>
              <button onClick={commitSave} className="h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90">Save curve</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

