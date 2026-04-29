import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Stat, Badge, StatusDot } from "@/components/ui-kit";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  Target,
  Activity,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  Users,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plan Overview · Helix IC" },
      {
        name: "description",
        content: "FY26 incentive compensation plan overview, workflow, and key indicators.",
      },
    ],
  }),
  component: Overview,
});

const STEPS = [
  { n: 1, to: "/plan-builder", label: "Plan Builder", icon: Layers, status: "done", desc: "Components & weights configured for 3 roles" },
  { n: 2, to: "/goal-setting", label: "Goal Setting Engine", icon: Target, status: "done", desc: "Blended methodology · 60/40 historical/potential" },
  { n: 3, to: "/payout-curve", label: "Payout Curve Designer", icon: TrendingUp, status: "current", desc: "Threshold, accelerator & cap design" },
  { n: 4, to: "/simulation", label: "Monte Carlo Simulation", icon: Activity, status: "todo", desc: "10,000 scenarios · validating fairness & budget" },
  { n: 5, to: "/fairness", label: "Fairness Testing", icon: ShieldCheck, status: "todo", desc: "Cross-region, cross-role equity validation" },
  { n: 6, to: "/approval", label: "Final Approval", icon: CheckCircle, status: "todo", desc: "Leadership sign-off & launch readiness" },
] as const;

const trendData = Array.from({ length: 24 }, (_, i) => ({
  m: i,
  baseline: 78 + Math.sin(i / 3) * 4 + i * 0.4,
  proposed: 82 + Math.sin(i / 3) * 3 + i * 0.6,
}));

function Overview() {
  return (
    <div className="px-8 py-8 max-w-[1600px] space-y-7">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.13_262)] text-primary-foreground shadow-premium">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-info/20 blur-3xl" />
        <div className="relative px-8 py-9 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 h-6 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium backdrop-blur">
              <Sparkles className="size-3" /> FY26 Plan Cycle · Specialty Oncology BU
            </div>
            <h1 className="mt-4 text-[32px] font-semibold tracking-tight leading-[1.1] text-balance">
              Design an IC plan that's fair, motivating,<br />affordable, and ready to launch.
            </h1>
            <p className="mt-3 text-[14px] text-primary-foreground/75 max-w-xl">
              Helix orchestrates the full plan-design lifecycle — from component weighting through Monte Carlo
              validation to executive approval — in one auditable workspace.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                to="/plan-builder"
                className="h-10 px-4 inline-flex items-center gap-2 rounded-md bg-white text-primary text-[13px] font-semibold hover:bg-white/90 shadow-elevated"
              >
                Continue Plan Design <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/approval"
                className="h-10 px-4 inline-flex items-center gap-2 rounded-md border border-white/20 text-[13px] font-medium hover:bg-white/10"
              >
                Jump to Approval Room
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Plan Maturity" value="68%" hint="4 of 7 stages complete" />
            <MiniStat label="Fairness Score" value="A−" hint="Above target threshold" />
            <MiniStat label="Budget at Risk" value="2.1%" hint="$1.4M of $66.5M" />
            <MiniStat label="Reps Modeled" value="1,247" hint="Across 12 regions" />
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-0">
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">Total IC Budget</div>
            <DollarSign className="size-3.5 text-muted-foreground" />
          </div>
          <div className="px-5 pb-4">
            <div className="text-[26px] font-semibold tracking-tight num">$66.5<span className="text-[16px] text-muted-foreground">M</span></div>
            <div className="mt-1 flex items-center gap-1.5 text-[11.5px]"><span className="text-success font-medium">+4.2%</span><span className="text-muted-foreground">vs FY25</span></div>
          </div>
        </Card>
        <Card className="p-0">
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">Eligible Reps</div>
            <Users className="size-3.5 text-muted-foreground" />
          </div>
          <div className="px-5 pb-4">
            <div className="text-[26px] font-semibold tracking-tight num">1,247</div>
            <div className="mt-1 text-[11.5px] text-muted-foreground">Reps · 84 RBMs · 12 ASMs</div>
          </div>
        </Card>
        <Card className="p-0">
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">Projected Avg Attainment</div>
            <Activity className="size-3.5 text-muted-foreground" />
          </div>
          <div className="px-5 pb-4">
            <div className="text-[26px] font-semibold tracking-tight num">102.4%</div>
            <div className="mt-1 text-[11.5px] text-muted-foreground">Median across 10k simulations</div>
          </div>
        </Card>
        <Card className="p-0">
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">Plan Health Score</div>
            <ShieldCheck className="size-3.5 text-success" />
          </div>
          <div className="px-5 pb-4">
            <div className="flex items-baseline gap-2">
              <div className="text-[26px] font-semibold tracking-tight num text-success">87</div>
              <div className="text-[11.5px] text-muted-foreground">/ 100</div>
            </div>
            <div className="mt-1 text-[11.5px] text-success font-medium">Healthy · ready for review</div>
          </div>
        </Card>
      </div>

      {/* Workflow + chart */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-5">
        <Card className="p-0">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <div className="text-[14px] font-semibold tracking-tight">Plan Design Workflow</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">7-stage governed process · all changes audit-logged</div>
            </div>
            <Badge tone="primary">v2.4 · Draft</Badge>
          </div>
          <div className="px-5 pb-5 space-y-1.5">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const done = s.status === "done";
              const current = s.status === "current";
              return (
                <Link
                  key={s.n}
                  to={s.to}
                  className={`group flex items-center gap-4 rounded-lg p-3.5 border transition-all ${
                    current
                      ? "border-primary/30 bg-primary-muted/40"
                      : "border-border hover:border-border-strong hover:bg-muted/40"
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`size-9 rounded-lg grid place-items-center shrink-0 ${
                        done
                          ? "bg-success/10 text-success"
                          : current
                          ? "bg-primary text-primary-foreground shadow-elevated"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle2 className="size-4.5" /> : <Icon className="size-4.5" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[13.5px] font-medium text-foreground">{s.label}</div>
                      {done && <Badge tone="success">Complete</Badge>}
                      {current && (
                        <Badge tone="primary">
                          <Clock className="size-2.5" /> In Progress
                        </Badge>
                      )}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-0">
            <div className="px-5 pt-5 pb-1">
              <div className="text-[14px] font-semibold tracking-tight">Projected Attainment Trend</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">FY26 vs FY25 baseline · simulated</div>
            </div>
            <div className="px-2 pb-2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={[70, 110]} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="baseline" stroke="var(--muted-foreground)" strokeDasharray="4 4" fill="none" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="proposed" stroke="var(--chart-1)" fill="url(#g1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div className="text-[14px] font-semibold tracking-tight">Recent Activity</div>
              <button className="text-[11.5px] text-primary font-medium">View audit log</button>
            </div>
            <div className="divide-y divide-border">
              {[
                { who: "S. Mehta", what: "Adjusted Product A weight to 40%", when: "12 min ago", tone: "info" as const },
                { who: "R. Iyer", what: "Approved goal-setting methodology", when: "1 hr ago", tone: "success" as const },
                { who: "System", what: "Monte Carlo run #14 complete", when: "2 hr ago", tone: "info" as const },
                { who: "L. Park", what: "Flagged West region target spread", when: "Yesterday", tone: "warning" as const },
              ].map((a, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <StatusDot tone={a.tone} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px]"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">— {a.what}</span></div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{a.when}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl bg-white/8 backdrop-blur border border-white/10 p-3.5">
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-primary-foreground/60 font-medium">{label}</div>
      <div className="mt-1 text-[22px] font-semibold tracking-tight num">{value}</div>
      <div className="text-[11px] text-primary-foreground/60 mt-0.5">{hint}</div>
    </div>
  );
}
