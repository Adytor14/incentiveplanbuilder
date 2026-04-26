import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, Slider } from "@/components/ui-kit";
import { Rocket, Star, TrendingUp, Package } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Cell, Tooltip, RadialBarChart, RadialBar, Legend } from "recharts";

export const Route = createFileRoute("/product-weights")({
  head: () => ({
    meta: [
      { title: "Product Weights · Helix IC" },
      { name: "description", content: "Allocate strategic weight across product portfolio with launch boosters." },
    ],
  }),
  component: ProductWeights,
});

type Product = {
  id: string;
  name: string;
  brand: string;
  weight: number;
  priority: "Core" | "Growth" | "Launch" | "Mature";
  fy25: number;
  fy26Target: number;
  booster: number;
  ta: string;
};

const INITIAL: Product[] = [
  { id: "a", name: "Onclera", brand: "Product A", weight: 40, priority: "Core", fy25: 142, fy26Target: 168, booster: 0, ta: "Solid Tumors" },
  { id: "b", name: "Velorin", brand: "Product B", weight: 25, priority: "Growth", fy25: 88, fy26Target: 124, booster: 10, ta: "Hematology" },
  { id: "c", name: "Synaxen", brand: "Product C", weight: 20, priority: "Launch", fy25: 0, fy26Target: 42, booster: 25, ta: "Immuno-Onc" },
  { id: "d", name: "Korivex", brand: "Product D", weight: 10, priority: "Mature", fy25: 65, fy26Target: 60, booster: 0, ta: "Supportive Care" },
  { id: "e", name: "Renalyx", brand: "Product E", weight: 5, priority: "Mature", fy25: 38, fy26Target: 36, booster: 0, ta: "Renal" },
];

const TONES = {
  Core: "info" as const,
  Growth: "success" as const,
  Launch: "primary" as const,
  Mature: "neutral" as const,
};

function ProductWeights() {
  const [products, setProducts] = useState(INITIAL);
  const total = products.reduce((s, p) => s + p.weight, 0);
  const balanced = total === 100;

  const update = (id: string, patch: Partial<Product>) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const chartData = products.map((p, i) => ({
    name: p.name,
    weight: p.weight,
    fill: `var(--chart-${(i % 5) + 1})`,
  }));

  const radialData = products.map((p, i) => ({
    name: p.name,
    growth: Math.round(((p.fy26Target - p.fy25) / Math.max(p.fy25, 1)) * 100),
    fill: `var(--chart-${(i % 5) + 1})`,
  }));

  return (
    <div>
      <PageHeader
        step={2}
        title="Product Weight Configuration"
        description="Allocate strategic weight across the portfolio. Apply launch boosters to drive emphasis on new molecules."
        prev={{ to: "/plan-builder", label: "Plan Builder" }}
        next={{ to: "/goal-setting", label: "Goal Setting" }}
      />
      <div className="px-8 py-7 max-w-[1600px] space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Package} label="Active Products" value="5" hint="Across 4 therapy areas" />
          <KpiCard icon={Rocket} label="Launch Products" value="1" hint="Synaxen · Q2 FY26" tone="primary" />
          <KpiCard icon={Star} label="Strategic Weight" value={`${products.find(p => p.priority === "Launch")?.weight ?? 0}%`} hint="Allocated to launch" tone="info" />
          <KpiCard icon={TrendingUp} label="Portfolio Growth" value="+18.4%" hint="Weighted FY26 vs FY25" tone="success" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
              <div>
                <div className="text-[15px] font-semibold tracking-tight">Portfolio Weight Allocation</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">Drag sliders to rebalance · changes ripple to component plans</div>
              </div>
              <Badge tone={balanced ? "success" : "warning"}>Total {total}%</Badge>
            </div>
            <div className="divide-y divide-border">
              {products.map((p, i) => (
                <div key={p.id} className="px-5 py-4 grid grid-cols-[1.6fr_1fr_180px] gap-5 items-center">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-lg grid place-items-center" style={{ background: `color-mix(in oklch, var(--chart-${(i % 5) + 1}) 15%, transparent)` }}>
                        <Package className="size-4" style={{ color: `var(--chart-${(i % 5) + 1})` }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-[13.5px] font-semibold">{p.name}</div>
                          <Badge tone={TONES[p.priority]}>{p.priority}</Badge>
                          {p.booster > 0 && <Badge tone="warning"><Rocket className="size-2.5" /> +{p.booster}% boost</Badge>}
                        </div>
                        <div className="text-[11.5px] text-muted-foreground">{p.brand} · {p.ta}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="text-[11px] text-muted-foreground">Strategic Weight</div>
                      <div className="text-[15px] font-semibold num">{p.weight}%</div>
                    </div>
                    <Slider value={p.weight} onChange={(v) => update(p.id, { weight: v })} max={60} trackClass={`bg-[var(--chart-${(i % 5) + 1})]`} />
                  </div>
                  <div className="text-right">
                    <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium">FY25 → FY26</div>
                    <div className="mt-0.5 text-[13px] num font-medium">${p.fy25}M → ${p.fy26Target}M</div>
                    <div className={`text-[11px] num font-medium ${p.fy26Target >= p.fy25 ? "text-success" : "text-destructive"}`}>
                      {p.fy26Target >= p.fy25 ? "+" : ""}{Math.round(((p.fy26Target - p.fy25) / Math.max(p.fy25, 1)) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-0">
              <div className="px-5 pt-5 pb-2">
                <div className="text-[14px] font-semibold tracking-tight">Weight Distribution</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">Visualize portfolio mix</div>
              </div>
              <div className="px-2 pb-3 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--foreground)" }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-0">
              <div className="px-5 pt-5 pb-2">
                <div className="text-[14px] font-semibold tracking-tight">Growth Potential</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">FY26 target growth by product</div>
              </div>
              <div className="px-2 pb-3 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="25%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="growth" cornerRadius={6} />
                    <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 11 }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, hint, tone = "neutral" }: any) {
  const toneCls = { neutral: "bg-muted", primary: "bg-primary-muted", info: "bg-info/10", success: "bg-success/10" }[tone as string];
  const iconCls = { neutral: "text-muted-foreground", primary: "text-primary", info: "text-info", success: "text-success" }[tone as string];
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`size-10 rounded-lg grid place-items-center ${toneCls}`}>
        <Icon className={`size-4.5 ${iconCls}`} />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">{label}</div>
        <div className="text-[20px] font-semibold tracking-tight num leading-tight">{value}</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      </div>
    </Card>
  );
}
