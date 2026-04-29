import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, Slider } from "@/components/ui-kit";
import { Sparkles, Check, Edit3, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/goal-setting")({
  head: () => ({
    meta: [
      { title: "Goal Setting Engine · Helix IC" },
      { name: "description", content: "Set targets via historical, equal-distribution, potential, or blended methodologies." },
    ],
  }),
  component: GoalSetting,
});

type Method = "blended";

const METHODS = [
  { id: "blended" as Method, name: "Blended (Recommended)", icon: Sparkles, desc: "Weighted hybrid: historical, potential, equal", formula: "(Hist × W₁) + (Pot × W₂) + (Equal × W₃)" },
];

const PREVIEW = [
  { rep: "A. Kapoor", region: "NE", lyActuals: 1240, potential: 1620, suggested: 1428, override: null },
  { rep: "M. Chen", region: "W", lyActuals: 980, potential: 1480, suggested: 1180, override: 1240 },
  { rep: "R. Patel", region: "SW", lyActuals: 1480, potential: 1720, suggested: 1592, override: null },
  { rep: "J. Williams", region: "SE", lyActuals: 1120, potential: 1380, suggested: 1232, override: null },
  { rep: "T. Nakamura", region: "MW", lyActuals: 1360, potential: 1540, suggested: 1456, override: null },
  { rep: "L. García", region: "W", lyActuals: 890, potential: 1340, suggested: 1085, override: 1140 },
];

const DEFAULT_BLEND = { w1: 50, w2: 30, w3: 20 };

// Validate W1/W2/W3 — fall back to safe defaults if any are missing, NaN, negative, or don't sum to 100
function safeBlend(input: Partial<{ w1: number; w2: number; w3: number }> | null | undefined) {
  if (!input || typeof input !== "object") return { ...DEFAULT_BLEND };
  const keys = ["w1", "w2", "w3"] as const;
  const valid = keys.every((k) => {
    const v = (input as any)[k];
    return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;
  });
  if (!valid) return { ...DEFAULT_BLEND };
  const sum = (input.w1 ?? 0) + (input.w2 ?? 0) + (input.w3 ?? 0);
  if (sum !== 100) return { ...DEFAULT_BLEND };
  return { w1: input.w1!, w2: input.w2!, w3: input.w3! };
}

function GoalSetting() {
  const [method, setMethod] = useState<Method>("blended");
  // Blended weights: Historical (W₁), Potential (W₂), Equal Distribution (W₃) — always sum to 100
  const [blend, setBlend] = useState<{ w1: number; w2: number; w3: number }>(DEFAULT_BLEND);
  const safe = safeBlend(blend); // guard before render
  const growthState = useState(15);
  const growth = growthState[0];
  const setGrowth = growthState[1];

  // Adjust one blend weight; redistribute the delta proportionally across the other two
  const setBlendWeight = (key: "w1" | "w2" | "w3", next: number) => {
    setBlend((prev) => {
      const clamped = Math.max(0, Math.min(100, Math.round(next)));
      const others = (["w1", "w2", "w3"] as const).filter((k) => k !== key);
      const remaining = 100 - clamped;
      const otherSum = prev[others[0]] + prev[others[1]];
      let a: number;
      let b: number;
      if (otherSum <= 0) {
        a = Math.round(remaining / 2);
        b = remaining - a;
      } else {
        a = Math.round((prev[others[0]] / otherSum) * remaining);
        b = remaining - a;
      }
      return { ...prev, [key]: clamped, [others[0]]: a, [others[1]]: b } as typeof prev;
    });
  };

  return (
    <div>
      <PageHeader
        step={2}
        title="Goal Setting Engine"
        description="Choose a methodology, calibrate inputs, then preview rep-level targets before publishing."
        prev={{ to: "/plan-builder", label: "Plan Builder" }}
        next={{ to: "/payout-curve", label: "Payout Curve" }}
      />
      <div className="px-8 py-7 max-w-[1600px] space-y-6">
        {/* Method card — only Blended */}
        <div className="grid grid-cols-1 gap-4">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className="text-left p-5 rounded-xl border border-primary bg-primary-muted/40 shadow-elevated ring-1 ring-primary/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 rounded-lg grid place-items-center bg-primary text-primary-foreground">
                    <Icon className="size-4.5" />
                  </div>
                  <div className="size-5 rounded-full bg-primary text-primary-foreground grid place-items-center"><Check className="size-3" strokeWidth={3} /></div>
                </div>
                <div className="text-[14px] font-semibold tracking-tight">{m.name}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{m.desc}</div>
                <div className="mt-3 px-2.5 py-1.5 rounded-md bg-muted/60 border border-border inline-block">
                  <div className="text-[10px] font-mono text-muted-foreground">{m.formula}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-5">
          {/* Calibration */}
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <div className="text-[14px] font-semibold tracking-tight">Calibration</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">{METHODS.find((m) => m.id === method)?.name}</div>
            </div>
            <div className="p-5 space-y-5">
              {method === "blended" && (
                <div className="space-y-4">
                  {([
                    { key: "w1" as const, label: "Historical weight (W₁)", hint: "Last year actuals × growth" },
                    { key: "w2" as const, label: "Potential weight (W₂)", hint: "Territory potential share" },
                    { key: "w3" as const, label: "Equal Distribution (W₃)", hint: "Total target ÷ headcount" },
                  ]).map((row) => (
                    <div key={row.key}>
                      <div className="flex items-baseline justify-between mb-2">
                        <label className="text-[12px] font-medium">{row.label}</label>
                        <span className="text-[14px] font-semibold num">{safe[row.key]}%</span>
                      </div>
                      <Slider value={safe[row.key]} onChange={(v) => setBlendWeight(row.key, v)} />
                      <div className="mt-1 text-[10.5px] text-muted-foreground">{row.hint}</div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
                    <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium">Blend total</span>
                    <span className="text-[13px] font-semibold num">{safe.w1 + safe.w2 + safe.w3}%</span>
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-[12px] font-medium">Growth Factor</label>
                  <span className="text-[14px] font-semibold num">+{growth}%</span>
                </div>
                <Slider value={growth} onChange={setGrowth} max={40} />
              </div>
              <div className="rounded-lg border border-info/30 bg-info/5 p-3 flex gap-2.5">
                <AlertCircle className="size-4 text-info shrink-0 mt-0.5" />
                <div className="text-[11.5px] text-foreground">
                  <span className="font-medium text-info">Recommended blend.</span> Pure historical underweights launch territories; pure potential overweights uncertain markets; equal distribution adds baseline fairness.
                </div>
              </div>
              <button className="w-full h-10 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 shadow-card">
                Recalculate Targets
              </button>
            </div>
          </Card>

          {/* Target preview */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { l: "Total Target", v: "$1.42B", h: "+15.2% YoY", t: "primary" as const },
                { l: "Avg Rep Target", v: "$1.14M", h: "P50: $1.12M", t: "neutral" as const },
                { l: "Manual Overrides", v: "23", h: "1.8% of reps", t: "warning" as const },
              ].map((s) => (
                <Card key={s.l} className="p-4">
                  <div className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground font-medium">{s.l}</div>
                  <div className="mt-1 text-[20px] font-semibold tracking-tight num">{s.v}</div>
                  <div className="mt-0.5"><Badge tone={s.t}>{s.h}</Badge></div>
                </Card>
              ))}
            </div>

            <Card className="p-0">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
                <div>
                  <div className="text-[14px] font-semibold tracking-tight">Target Preview</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">First 6 of 1,247 reps · adjustable with audit trail</div>
                </div>
                <button className="text-[12px] font-medium text-primary inline-flex items-center gap-1">
                  <Edit3 className="size-3.5" /> Bulk override
                </button>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground bg-muted/40">
                    <th className="text-left font-medium px-5 py-2.5">Rep</th>
                    <th className="text-left font-medium px-5 py-2.5">Region</th>
                    <th className="text-right font-medium px-5 py-2.5">LY Actuals</th>
                    <th className="text-right font-medium px-5 py-2.5">Potential</th>
                    <th className="text-right font-medium px-5 py-2.5">Suggested</th>
                    <th className="text-right font-medium px-5 py-2.5 pr-6">Final Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PREVIEW.map((r) => (
                    <tr key={r.rep} className="hover:bg-muted/30">
                      <td className="px-5 py-3 font-medium">{r.rep}</td>
                      <td className="px-5 py-3"><Badge tone="neutral">{r.region}</Badge></td>
                      <td className="px-5 py-3 text-right num text-muted-foreground">${r.lyActuals}K</td>
                      <td className="px-5 py-3 text-right num text-muted-foreground">${r.potential}K</td>
                      <td className="px-5 py-3 text-right num">${r.suggested}K</td>
                      <td className="px-5 py-3 text-right num font-semibold pr-6">
                        {r.override ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-warning">${r.override}K</span>
                            <Badge tone="warning">override</Badge>
                          </span>
                        ) : (
                          <>${r.suggested}K</>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
