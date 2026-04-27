import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, Slider, SegmentedTabs } from "@/components/ui-kit";
import { Plus, Trash2, ChevronRight, Lock, Zap, Info, CornerDownRight } from "lucide-react";

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
type Component = {
  id: string;
  name: string;
  category: string;
  weight: number;
  threshold: number;
  cap: number;
  accelerator: number;
  locked?: boolean;
};

const ROLE_LABEL: Record<Role, { name: string; sub: string; count: number }> = {
  rep: { name: "Sales Representative", sub: "Field-facing · 1,247 reps", count: 1247 },
  rbm: { name: "Regional Business Manager", sub: "First-line leader · 84 RBMs", count: 84 },
  asm: { name: "Area Sales Manager", sub: "Senior leader · 12 ASMs", count: 12 },
};

const INITIAL: Record<Role, Component[]> = {
  rep: [
    { id: "a", name: "Product A — Onclera", category: "Core Brand", weight: 40, threshold: 80, cap: 150, accelerator: 110 },
    { id: "b", name: "Product B — Velorin", category: "Growth Brand", weight: 30, threshold: 80, cap: 150, accelerator: 110 },
    { id: "c", name: "New Customer Activation", category: "Strategic", weight: 10, threshold: 70, cap: 200, accelerator: 100 },
    { id: "d", name: "MBO — Quality Calls", category: "Behavioral", weight: 10, threshold: 0, cap: 100, accelerator: 100 },
    { id: "e", name: "Contest Overlay", category: "Spiff", weight: 10, threshold: 0, cap: 200, accelerator: 100 },
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

  return (
    <div>
      <PageHeader
        step={1}
        title="Plan Builder"
        description="Compose IC plans for each role by weighting components, then set thresholds, caps and accelerators."
        prev={{ to: "/", label: "Overview" }}
        next={{ to: "/product-weights", label: "Product Weights" }}
      />
      <div className="px-8 py-7 max-w-[1600px] grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
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
              {list.map((c, idx) => (
                <div key={c.id} className="px-5 py-5 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
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
                      <span className="text-border-strong">·</span>
                      <button className="text-[11.5px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                        <Zap className="size-3" /> Add accelerator tier
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <NumField label="Threshold" suffix="%" value={c.threshold} onChange={(v) => update(c.id, { threshold: v })} />
                    <NumField label="Acc. @" suffix="%" value={c.accelerator} onChange={(v) => update(c.id, { accelerator: v })} />
                    <NumField label="Cap" suffix="%" value={c.cap} onChange={(v) => update(c.id, { cap: v })} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold tracking-tight">Component Summary</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">Snapshot used downstream by Goal Setting & Payout Curve</div>
              </div>
              <Link to="/product-weights" className="text-[12px] text-primary font-medium inline-flex items-center gap-1">
                Continue to Product Weights <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground bg-muted/40">
                  <th className="text-left font-medium px-5 py-2.5">Component</th>
                  <th className="text-left font-medium px-5 py-2.5">Category</th>
                  <th className="text-right font-medium px-5 py-2.5">Weight</th>
                  <th className="text-right font-medium px-5 py-2.5">Threshold</th>
                  <th className="text-right font-medium px-5 py-2.5">Accelerator</th>
                  <th className="text-right font-medium px-5 py-2.5 pr-6">Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((c, i) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">
                      <span className="inline-block size-2 rounded-sm mr-2 align-middle" style={{ background: `var(--chart-${(i % 5) + 1})` }} />
                      {c.name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{c.category}</td>
                    <td className="px-5 py-3 text-right num font-medium">{c.weight}%</td>
                    <td className="px-5 py-3 text-right num text-muted-foreground">{c.threshold}%</td>
                    <td className="px-5 py-3 text-right num text-muted-foreground">{c.accelerator}%</td>
                    <td className="px-5 py-3 text-right num text-muted-foreground pr-6">{c.cap}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border-strong bg-muted/30">
                  <td className="px-5 py-3 font-semibold" colSpan={2}>Total</td>
                  <td className={`px-5 py-3 text-right num font-semibold ${balanced ? "text-success" : "text-warning"}`}>{totalWeight}%</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
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
