import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, Slider } from "@/components/ui-kit";
import { History, Equal, Map, Sparkles, Check, Edit3, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/goal-setting")({
  head: () => ({
    meta: [
      { title: "Goal Setting Engine · Helix IC" },
      { name: "description", content: "Set targets via historical, equal-distribution, potential, or blended methodologies." },
    ],
  }),
  component: GoalSetting,
});

type Method = "historical" | "equal" | "potential" | "blended";

const METHODS = [
  { id: "historical" as Method, name: "Historical-based", icon: History, desc: "Last year sales × growth %", formula: "Target = LY × (1 + Growth)" },
  { id: "equal" as Method, name: "Equal Distribution", icon: Equal, desc: "Total target ÷ headcount", formula: "Target = Σ Sales / N reps" },
  { id: "potential" as Method, name: "Territory Potential", icon: Map, desc: "Potential × opportunity share", formula: "Target = Potential × Share" },
  { id: "blended" as Method, name: "Blended (Recommended)", icon: Sparkles, desc: "Weighted hybrid approach", formula: "(Hist × W₁) + (Pot × W₂)" },
];

const PREVIEW = [
  { rep: "A. Kapoor", region: "NE", lyActuals: 1240, potential: 1620, suggested: 1428, override: null },
  { rep: "M. Chen", region: "W", lyActuals: 980, potential: 1480, suggested: 1180, override: 1240 },
  { rep: "R. Patel", region: "SW", lyActuals: 1480, potential: 1720, suggested: 1592, override: null },
  { rep: "J. Williams", region: "SE", lyActuals: 1120, potential: 1380, suggested: 1232, override: null },
  { rep: "T. Nakamura", region: "MW", lyActuals: 1360, potential: 1540, suggested: 1456, override: null },
  { rep: "L. García", region: "W", lyActuals: 890, potential: 1340, suggested: 1085, override: 1140 },
];

function GoalSetting() {
  const [method, setMethod] = useState<Method>("blended");
  const [w1, setW1] = useState(60);
  const [growth, setGrowth] = useState(15);

  return (
    <div>
      <PageHeader
        step={2}
        title="Goal Setting Engine"
        description="Choose a methodology, calibrate inputs, then preview rep-level targets before publishing."
        prev={{ to: "/plan-builder", label: "Plan Builder" }}
        next={{ to: "/simulation", label: "Run Simulation" }}
      />
      <div className="px-8 py-7 max-w-[1600px] space-y-6">
        {/* Method cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {METHODS.map((m) => {
            const active = method === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`text-left p-5 rounded-xl border transition-all ${
                  active
                    ? "border-primary bg-primary-muted/40 shadow-elevated ring-1 ring-primary/20"
                    : "border-border bg-surface hover:border-border-strong shadow-card"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`size-10 rounded-lg grid place-items-center ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="size-4.5" />
                  </div>
                  {active && <div className="size-5 rounded-full bg-primary text-primary-foreground grid place-items-center"><Check className="size-3" strokeWidth={3} /></div>}
                  {m.id === "blended" && !active && <Badge tone="primary">Recommended</Badge>}
                </div>
                <div className="text-[14px] font-semibold tracking-tight">{m.name}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{m.desc}</div>
                <div className="mt-3 px-2.5 py-1.5 rounded-md bg-muted/60 border border-border">
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
                <>
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <label className="text-[12px] font-medium">Historical weight (W₁)</label>
                      <span className="text-[14px] font-semibold num">{w1}%</span>
                    </div>
                    <Slider value={w1} onChange={setW1} />
                    <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-muted-foreground">
                      <span>Historical {w1}%</span>
                      <span>Potential {100 - w1}%</span>
                    </div>
                  </div>
                </>
              )}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-[12px] font-medium">Growth Factor</label>
                  <span className="text-[14px] font-semibold num">+{growth}%</span>
                </div>
                <Slider value={growth} onChange={setGrowth} max={40} />
              </div>
              <div>
                <label className="text-[12px] font-medium">Market Scenario</label>
                <select className="mt-1.5 w-full h-9 rounded-md border border-border bg-background px-2.5 text-[13px]">
                  <option>Base case · steady demand</option>
                  <option>Bull · strong launch uptake</option>
                  <option>Bear · payer pressure</option>
                </select>
              </div>
              <div className="rounded-lg border border-info/30 bg-info/5 p-3 flex gap-2.5">
                <AlertCircle className="size-4 text-info shrink-0 mt-0.5" />
                <div className="text-[11.5px] text-foreground">
                  <span className="font-medium text-info">Recommended blend.</span> Pure historical underweights launch territories; pure potential overweights uncertain markets.
                </div>
              </div>
              <button className="w-full h-10 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 shadow-card">
                Recalculate Targets
              </button>
            </div>
          </Card>

          {/* Target preview */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { l: "Total Target", v: "$1.42B", h: "+15.2% YoY", t: "primary" as const },
                { l: "Avg Rep Target", v: "$1.14M", h: "P50: $1.12M", t: "neutral" as const },
                { l: "Manual Overrides", v: "23", h: "1.8% of reps", t: "warning" as const },
                { l: "Forecast Confidence", v: "84%", h: "Above 80% bar", t: "success" as const },
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
