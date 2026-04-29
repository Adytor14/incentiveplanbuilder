import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, Slider, SegmentedTabs } from "@/components/ui-kit";
import { Plus, Trash2, ChevronRight, Lock, Info, CornerDownRight, AlertTriangle, Wand2, Database, Users, Map as MapIcon } from "lucide-react";

export const Route = createFileRoute("/plan-builder")({
  head: () => ({
    meta: [
      { title: "Plan Builder · Helix IC" },
      { name: "description", content: "Configure incentive components, weights, thresholds and accelerators per role." },
    ],
  }),
  component: PlanBuilder,
});

type Role = "rep" | "rbm" | "asm";
type SubItem = {
  id: string;
  name: string;
  kind: "Goal" | "MBO";
  weight: number; // weight within parent product (sums to 100)
};
type Component = {
  id: string;
  name: string;
  category: string;
  weight: number;
  threshold: number;
  cap: number;
  accelerator: number;
  locked?: boolean;
  subItems?: SubItem[];
};

const ROLE_LABEL: Record<Role, { name: string; sub: string; count: number }> = {
  rep: { name: "Sales Representative", sub: "Field-facing · 1,247 reps", count: 1247 },
  rbm: { name: "Regional Business Manager", sub: "First-line leader · 84 RBMs", count: 84 },
  asm: { name: "Area Sales Manager", sub: "Senior leader · 12 ASMs", count: 12 },
};

const INITIAL: Record<Role, Component[]> = {
  rep: [
    {
      id: "a",
      name: "Product A — Onclera",
      category: "Core Brand",
      weight: 60,
      threshold: 80,
      cap: 150,
      accelerator: 110,
      subItems: [
        { id: "a1", name: "Volume Goal — TRx", kind: "Goal", weight: 60 },
        { id: "a2", name: "New Writer Activation", kind: "Goal", weight: 20 },
        { id: "a3", name: "MBO — Quality Calls", kind: "MBO", weight: 10 },
        { id: "a4", name: "MBO — Speaker Programs", kind: "MBO", weight: 10 },
      ],
    },
    {
      id: "b",
      name: "Product B — Velorin",
      category: "Growth Brand",
      weight: 40,
      threshold: 80,
      cap: 150,
      accelerator: 110,
      subItems: [
        { id: "b1", name: "Volume Goal — NRx", kind: "Goal", weight: 55 },
        { id: "b2", name: "Market Share Growth", kind: "Goal", weight: 25 },
        { id: "b3", name: "MBO — Targeted Reach", kind: "MBO", weight: 20 },
      ],
    },
  ],
  rbm: [
    { id: "a", name: "Team Attainment", category: "Roll-up", weight: 55, threshold: 80, cap: 150, accelerator: 110 },
    { id: "b", name: "Regional Growth %", category: "Strategic", weight: 25, threshold: 75, cap: 175, accelerator: 105 },
    { id: "c", name: "Manager MBO", category: "Behavioral", weight: 20, threshold: 0, cap: 100, accelerator: 100 },
  ],
  asm: [
    { id: "a", name: "Area Achievement", category: "Roll-up", weight: 50, threshold: 80, cap: 150, accelerator: 110 },
    { id: "b", name: "Productivity per Rep", category: "Efficiency", weight: 25, threshold: 85, cap: 140, accelerator: 110 },
    { id: "c", name: "Strategic Initiatives", category: "Strategic", weight: 25, threshold: 0, cap: 125, accelerator: 100 },
  ],
};

function PlanBuilder() {
  const [role, setRole] = useState<Role>("rep");
  const [components, setComponents] = useState(INITIAL);
  const list = components[role];
  const totalWeight = list.reduce((s, c) => s + c.weight, 0);
  const balanced = totalWeight === 100;

  const update = (id: string, patch: Partial<Component>) =>
    setComponents((prev) => ({
      ...prev,
      [role]: prev[role].map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));

  // Auto-rebalance: when one sub-item changes, distribute the delta proportionally
  // across the remaining sub-items so the product total stays at 100%.
  const setSubWeight = (componentId: string, subId: string, rawNext: number) =>
    setComponents((prev) => ({
      ...prev,
      [role]: prev[role].map((c) => {
        if (c.id !== componentId || !c.subItems) return c;
        const items = c.subItems;
        const target = items.find((s) => s.id === subId);
        if (!target) return c;

        // Clamp the changed weight between 0 and 100
        const nextWeight = Math.max(0, Math.min(100, Math.round(rawNext)));
        const others = items.filter((s) => s.id !== subId);
        const remainingBudget = 100 - nextWeight;
        const othersTotal = others.reduce((s, x) => s + x.weight, 0);

        let adjusted: SubItem[];
        if (others.length === 0) {
          adjusted = [{ ...target, weight: 100 }];
        } else if (othersTotal === 0) {
          // Distribute remaining budget evenly
          const each = Math.floor(remainingBudget / others.length);
          const remainder = remainingBudget - each * others.length;
          adjusted = items.map((s) => {
            if (s.id === subId) return { ...s, weight: nextWeight };
            const idx = others.findIndex((o) => o.id === s.id);
            return { ...s, weight: each + (idx < remainder ? 1 : 0) };
          });
        } else {
          // Proportional scaling, then integer-rounded with remainder reconciliation
          const scaled = others.map((s) => (s.weight / othersTotal) * remainingBudget);
          const floored = scaled.map((v) => Math.floor(v));
          let leftover = remainingBudget - floored.reduce((a, b) => a + b, 0);
          // Distribute leftover to items with the largest fractional parts
          const order = scaled
            .map((v, i) => ({ i, frac: v - Math.floor(v) }))
            .sort((a, b) => b.frac - a.frac);
          const finalOthers = floored.slice();
          for (let k = 0; k < order.length && leftover > 0; k++) {
            finalOthers[order[k].i] += 1;
            leftover -= 1;
          }
          adjusted = items.map((s) => {
            if (s.id === subId) return { ...s, weight: nextWeight };
            const oi = others.findIndex((o) => o.id === s.id);
            return { ...s, weight: Math.max(0, finalOthers[oi]) };
          });
        }

        return { ...c, subItems: adjusted };
      }),
    }));

  // Proportional normalization back to exactly 100% across ALL sub-items.
  const fixSubTo100 = (componentId: string) =>
    setComponents((prev) => ({
      ...prev,
      [role]: prev[role].map((c) => {
        if (c.id !== componentId || !c.subItems || c.subItems.length === 0) return c;
        const items = c.subItems;
        const total = items.reduce((s, x) => s + x.weight, 0);
        let adjusted: SubItem[];
        if (total === 0) {
          const each = Math.floor(100 / items.length);
          const remainder = 100 - each * items.length;
          adjusted = items.map((s, i) => ({ ...s, weight: each + (i < remainder ? 1 : 0) }));
        } else {
          const scaled = items.map((s) => (s.weight / total) * 100);
          const floored = scaled.map((v) => Math.floor(v));
          let leftover = 100 - floored.reduce((a, b) => a + b, 0);
          const order = scaled
            .map((v, i) => ({ i, frac: v - Math.floor(v) }))
            .sort((a, b) => b.frac - a.frac);
          const finalW = floored.slice();
          for (let k = 0; k < order.length && leftover > 0; k++) {
            finalW[order[k].i] += 1;
            leftover -= 1;
          }
          adjusted = items.map((s, i) => ({ ...s, weight: Math.max(0, finalW[i]) }));
        }
        return { ...c, subItems: adjusted };
      }),
    }));

  return (
    <div>
      <PageHeader
        step={1}
        title="Plan Builder"
        description="Compose IC plans for each role by weighting components, then set thresholds, caps and accelerators."
        prev={{ to: "/", label: "Overview" }}
        next={{ to: "/goal-setting", label: "Goal Setting" }}
      />
      <div className="px-8 py-7 max-w-[1600px] space-y-6">
        {/* Data Inputs */}
        <Card className="p-0">
          <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                <Database className="size-3.5 text-primary" /> Data Inputs
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Source data feeding the plan builder</div>
            </div>
            <Badge tone="success">Synced · 2 hr ago</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
                <Database className="size-3.5" /> Previous Year Sales
              </div>
              <div className="mt-2 text-[22px] font-semibold tracking-tight num">$1.24B</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">FY25 actuals · 24 months historical</div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
                <Users className="size-3.5" /> No. of Sales Reps
              </div>
              <div className="mt-2 text-[22px] font-semibold tracking-tight num">1,247</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">Eligible · 84 RBMs · 12 ASMs</div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
                <MapIcon className="size-3.5" /> Territory Potential
              </div>
              <div className="mt-2 text-[22px] font-semibold tracking-tight num">$1.62B</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">Modeled opportunity · 12 regions</div>
            </div>
          </div>
        </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
        {/* Role rail */}
        <div className="space-y-4">
          <Card className="p-0">
            <div className="px-4 pt-4 pb-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
              Plan Audience
            </div>
            <div className="p-2 space-y-1">
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => {
                const active = r === role;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full text-left rounded-md p-3 transition-all ${
                      active ? "bg-primary text-primary-foreground shadow-card" : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-medium">{ROLE_LABEL[r].name}</div>
                      <ChevronRight className={`size-3.5 ${active ? "opacity-100" : "opacity-40"}`} />
                    </div>
                    <div className={`text-[11.5px] mt-0.5 ${active ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                      {ROLE_LABEL[r].sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium mb-3">Weight Allocation</div>
            <div className="flex items-baseline justify-between">
              <div className="text-[28px] font-semibold tracking-tight num">
                {totalWeight}<span className="text-muted-foreground text-[16px]">%</span>
              </div>
              <Badge tone={balanced ? "success" : "warning"}>{balanced ? "Balanced" : `${100 - totalWeight}% off`}</Badge>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden flex">
              {list.map((c, i) => (
                <div
                  key={c.id}
                  style={{ width: `${c.weight}%`, background: `var(--chart-${(i % 5) + 1})` }}
                />
              ))}
            </div>
            <div className="mt-3 text-[11.5px] text-muted-foreground flex items-start gap-1.5">
              <Info className="size-3 mt-0.5 shrink-0" />
              Components must sum to 100%. Use sliders to rebalance.
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium mb-3">Plan Health</div>
            <div className="space-y-2.5">
              {[
                { l: "Component count", v: `${list.length} active`, tone: "success" as const },
                { l: "Strategic mix", v: "32% strategic", tone: "success" as const },
                { l: "Cap exposure", v: "Within budget", tone: "success" as const },
                { l: "Accelerator slope", v: "Moderate", tone: "info" as const },
              ].map((m) => (
                <div key={m.l} className="flex items-center justify-between">
                  <div className="text-[12px] text-muted-foreground">{m.l}</div>
                  <Badge tone={m.tone}>{m.v}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Editor */}
        <div className="space-y-5">
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
              <div>
                <div className="text-[15px] font-semibold tracking-tight">{ROLE_LABEL[role].name} · Components</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{ROLE_LABEL[role].sub}</div>
              </div>
              <div className="flex items-center gap-2">
                <SegmentedTabs value="grid" onChange={() => {}} options={[{ value: "grid", label: "Detailed" }, { value: "table", label: "Compact" }]} />
                <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90">
                  <Plus className="size-3.5" /> Add Component
                </button>
              </div>
            </div>

            <div className="divide-y divide-border">
              {list.map((c, idx) => {
                const subTotal = c.subItems?.reduce((s, x) => s + x.weight, 0) ?? 0;
                const subBalanced = !c.subItems || subTotal === 100;
                return (
                  <div key={c.id} className="px-5 py-5">
                    <div>
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div
                                className="size-2.5 rounded-sm"
                                style={{ background: `var(--chart-${(idx % 5) + 1})` }}
                              />
                              <div className="text-[14px] font-semibold text-foreground truncate">{c.name}</div>
                              {c.locked && <Lock className="size-3 text-muted-foreground" />}
                            </div>
                            <div className="text-[11.5px] text-muted-foreground mt-1 ml-4.5">{c.category}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[22px] font-semibold tracking-tight num">{c.weight}%</div>
                            <div className="text-[10.5px] text-muted-foreground -mt-0.5">component weight</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Slider
                            value={c.weight}
                            onChange={(v) => update(c.id, { weight: v })}
                            max={100}
                            trackClass={`bg-[var(--chart-${(idx % 5) + 1})]`}
                          />
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button className="text-[11.5px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                            <Trash2 className="size-3" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {c.subItems && (
                      <div className="mt-5 ml-4 pl-5 border-l-2 border-dashed border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="size-3.5 text-muted-foreground" />
                            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
                              Goals & MBOs within {c.name.split("—")[1]?.trim() ?? c.name}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge tone={subBalanced ? "success" : "warning"}>
                              {subBalanced ? "Balanced 100%" : `${subTotal}% (${subTotal > 100 ? "+" : ""}${subTotal - 100})`}
                            </Badge>
                            <button className="h-7 px-2.5 inline-flex items-center gap-1 rounded-md border border-border bg-background text-[11.5px] font-medium hover:bg-muted">
                              <Plus className="size-3" /> Add sub-item
                            </button>
                          </div>
                        </div>
                        <div className="rounded-md border border-border overflow-hidden">
                          <table className="w-full text-[12.5px]">
                            <thead>
                              <tr className="bg-muted/40 text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
                                <th className="text-left font-medium px-3 py-2">Sub-component</th>
                                <th className="text-left font-medium px-3 py-2 w-[70px]">Type</th>
                                <th className="text-left font-medium px-3 py-2">Weight allocation</th>
                                <th className="text-right font-medium px-3 py-2 w-[80px]">Weight</th>
                                <th className="px-3 py-2 w-[40px]" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {c.subItems.map((s, si) => (
                                <tr key={s.id} className="hover:bg-muted/20">
                                  <td className="px-3 py-2.5 font-medium">
                                    <span
                                      className="inline-block size-1.5 rounded-full mr-2 align-middle opacity-70"
                                      style={{ background: `var(--chart-${(idx % 5) + 1})` }}
                                    />
                                    {s.name}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <Badge tone={s.kind === "Goal" ? "info" : "neutral"}>{s.kind}</Badge>
                                  </td>
                                  <td className="px-3 py-2.5 pr-5">
                                    <Slider
                                      value={s.weight}
                                      onChange={(v) => setSubWeight(c.id, s.id, v)}
                                      max={100}
                                      trackClass={`bg-[var(--chart-${(idx % 5) + 1})] opacity-80`}
                                    />
                                  </td>
                                  <td className="px-3 py-2.5 text-right num font-semibold">
                                    <input
                                      type="number"
                                      value={s.weight}
                                      onChange={(e) => setSubWeight(c.id, s.id, Number(e.target.value))}
                                      className="w-14 h-7 text-right pr-1 rounded border border-border bg-background text-[12.5px] num font-medium focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                                    />
                                    <span className="text-muted-foreground ml-0.5">%</span>
                                  </td>
                                  <td className="px-3 py-2.5 text-right">
                                    <button className="text-muted-foreground hover:text-destructive">
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </td>
                                  {si === -1 && <td />}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {subBalanced ? (
                          <div className="mt-2 text-[11px] text-muted-foreground flex items-start gap-1.5">
                            <Info className="size-3 mt-0.5 shrink-0" />
                            Sub-component weights sum to 100%. Adjusting one slider auto-rebalances the others.
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2">
                            <div className="flex items-start gap-2 text-[12px] text-foreground">
                              <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-warning" />
                              <span>
                                Sub-component weights total <span className="num font-semibold">{subTotal}%</span> —{" "}
                                {subTotal > 100 ? "over" : "under"} by{" "}
                                <span className="num font-semibold">{Math.abs(100 - subTotal)}%</span>. They must sum to 100% within this product.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => fixSubTo100(c.id)}
                              className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-md bg-warning text-warning-foreground text-[11.5px] font-semibold hover:opacity-90 shrink-0"
                            >
                              <Wand2 className="size-3" /> Fix to 100%
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NumField({ label, suffix, value, onChange }: { label: string; suffix: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">{label}</div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-9 pl-2.5 pr-7 rounded-md border border-border bg-background text-[13px] num font-medium focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">{suffix}</span>
      </div>
    </label>
  );
}
