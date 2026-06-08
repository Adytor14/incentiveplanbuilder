import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Badge, StatusDot } from "@/components/ui-kit";
import {
  ArrowRight,
  Database,
  Target,
  TrendingUp,
  FileText,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Upload,
  MapPin,
  Users,
  BarChart3,
  Sparkles,
  Rocket,
  FileSpreadsheet,
  ClipboardList,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Planning Workspace · IC Design" },
      {
        name: "description",
        content:
          "IC Design planning, goal-setting, and reporting workspace for US pharma commercial operations.",
      },
    ],
  }),
  component: Dashboard,
});

// ---------- Mock data ----------

const DATASETS = [
  {
    name: "HCP Historical Sales",
    file: "hcp_sales_fy23_fy25.csv",
    rows: "2.4M rows",
    uploaded: "May 28, 2026",
    status: "validated" as const,
    icon: BarChart3,
  },
  {
    name: "Territory Alignment",
    file: "territory_alignment_v4.xlsx",
    rows: "1,247 territories",
    uploaded: "May 30, 2026",
    status: "validated" as const,
    icon: MapPin,
  },
  {
    name: "Sales Managers",
    file: "managers_roster.csv",
    rows: "96 managers",
    uploaded: "Jun 02, 2026",
    status: "validated" as const,
    icon: Users,
  },
  {
    name: "Sales Representatives",
    file: "reps_roster_fy26.csv",
    rows: "1,247 reps",
    uploaded: "Jun 02, 2026",
    status: "validated" as const,
    icon: Users,
  },
  {
    name: "Territory Potential",
    file: "territory_potential_model.xlsx",
    rows: "1,247 territories",
    uploaded: "Jun 04, 2026",
    status: "warning" as const,
    icon: Target,
  },
  {
    name: "Market Events Calendar",
    file: "market_events_2026.csv",
    rows: "182 events",
    uploaded: "Jun 06, 2026",
    status: "pending" as const,
    icon: FileSpreadsheet,
  },
];

const KPIS = [
  {
    label: "Historical Sales (FY25)",
    value: "$1.24B",
    delta: "+6.8% YoY",
    tone: "success" as const,
    icon: BarChart3,
  },
  {
    label: "Territory Potential",
    value: "$1.62B",
    delta: "Addressable market",
    tone: "info" as const,
    icon: Target,
  },
  {
    label: "Forecast Opportunity",
    value: "$1.38B",
    delta: "+11.3% vs FY25",
    tone: "success" as const,
    icon: TrendingUp,
  },
  {
    label: "Incremental Opportunity",
    value: "$142M",
    delta: "Gap to potential",
    tone: "warning" as const,
    icon: Sparkles,
  },
  {
    label: "Goal Achievement Potential",
    value: "94.6%",
    delta: "Median across reps",
    tone: "success" as const,
    icon: CheckCircle2,
  },
];

const COMPARE = [
  { region: "Northeast", historical: 312, potential: 405, goal: 348 },
  { region: "Southeast", historical: 268, potential: 332, goal: 295 },
  { region: "Midwest", historical: 221, potential: 280, goal: 245 },
  { region: "South Central", historical: 184, potential: 246, goal: 208 },
  { region: "Mountain", historical: 121, potential: 168, goal: 138 },
  { region: "West", historical: 134, potential: 189, goal: 152 },
];

const TERRITORY_GOALS = [
  { id: "T-1042", name: "Boston Metro", potential: 4.8, goal: 4.2, contribution: 87, status: "ok" },
  { id: "T-1108", name: "NYC East", potential: 6.2, goal: 6.1, contribution: 98, status: "stretch" },
  { id: "T-1209", name: "Philadelphia", potential: 3.9, goal: 4.4, contribution: 113, status: "risk" },
  { id: "T-1311", name: "Atlanta North", potential: 5.1, goal: 4.6, contribution: 90, status: "ok" },
  { id: "T-1422", name: "Chicago West", potential: 4.5, goal: 5.1, contribution: 114, status: "risk" },
  { id: "T-1530", name: "Dallas Central", potential: 3.7, goal: 3.3, contribution: 89, status: "ok" },
  { id: "T-1644", name: "Denver", potential: 2.9, goal: 2.7, contribution: 93, status: "ok" },
  { id: "T-1751", name: "Bay Area South", potential: 5.6, goal: 5.4, contribution: 96, status: "stretch" },
];

const REPORTS = [
  { name: "Goal Report — FY26", type: "Goals", updated: "Jun 07", size: "1.2 MB", format: "XLSX" },
  { name: "MBO Report — Q1 FY26", type: "MBO", updated: "Jun 06", size: "640 KB", format: "PDF" },
  { name: "IC Design Summary", type: "IC Design", updated: "Jun 07", size: "2.1 MB", format: "PDF" },
  { name: "Territory Roll-up", type: "Territory", updated: "Jun 05", size: "880 KB", format: "XLSX" },
  { name: "Detailed Plan Output", type: "Plan Output", updated: "Jun 07", size: "3.4 MB", format: "ZIP" },
  { name: "Assumptions Log", type: "Plan Output", updated: "Jun 04", size: "210 KB", format: "PDF" },
];

const trendData = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  historical: 92 + Math.sin(i / 2) * 6 + i * 0.6,
  forecast: 98 + Math.sin(i / 2) * 4 + i * 0.9,
}));

const ROADMAP = [
  { title: "IC Design → IC Admin integration", quarter: "Q3 FY26" },
  { title: "Submit to IC Admin workflow", quarter: "Q3 FY26" },
  { title: "Approval workflow", quarter: "Q4 FY26" },
  { title: "Health Check Optimization", quarter: "Q4 FY26" },
  { title: "Optimization engine", quarter: "Q1 FY27" },
];

// ---------- Component ----------

function Dashboard() {
  return (
    <div className="px-8 py-8 max-w-[1600px] space-y-7">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.13_262)] text-primary-foreground shadow-premium">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-info/20 blur-3xl" />
        <div className="relative px-8 py-9 grid lg:grid-cols-[1.5fr_1fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 h-6 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium backdrop-blur">
              <Sparkles className="size-3" /> FY26 Planning Cycle · Specialty Oncology BU
            </div>
            <h1 className="mt-4 text-[32px] font-semibold tracking-tight leading-[1.1] text-balance">
              Plan, set goals, and report —<br /> all in one IC Design workspace.
            </h1>
            <p className="mt-3 text-[14px] text-primary-foreground/75 max-w-xl">
              Bring together HCP sales, territory potential, and rep alignment to design
              data-driven goals and generate executive-ready reports.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/data-inputs"
                className="h-10 px-4 inline-flex items-center gap-2 rounded-md bg-white text-primary text-[13px] font-semibold hover:bg-white/90 shadow-elevated"
              >
                Review Data Inputs <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/goal-setting"
                className="h-10 px-4 inline-flex items-center gap-2 rounded-md border border-white/20 text-[13px] font-medium hover:bg-white/10"
              >
                <Target className="size-4" /> Open Goal Setting
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Territories" value="1,247" hint="12 regions" />
            <MiniStat label="Reps Planned" value="1,247" hint="96 managers" />
            <MiniStat label="Forecast" value="$1.38B" hint="+11.3% vs FY25" />
            <MiniStat label="Reports Ready" value="6" hint="Goals · MBO · IC" />
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          const toneCls = {
            success: "text-success",
            warning: "text-warning",
            info: "text-info",
          }[k.tone];
          return (
            <Card key={k.label} className="p-0">
              <div className="px-5 pt-5 pb-2 flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
                  {k.label}
                </div>
                <Icon className={`size-3.5 ${toneCls}`} />
              </div>
              <div className="px-5 pb-4">
                <div className="text-[24px] font-semibold tracking-tight num">{k.value}</div>
                <div className={`mt-1 text-[11.5px] font-medium ${toneCls}`}>{k.delta}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Forecast vs Historical vs Potential */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-5">
        <Card className="p-0">
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div>
              <div className="text-[14px] font-semibold tracking-tight">
                Historical vs Potential vs Proposed Goals
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Regional view · USD millions
              </div>
            </div>
            <Badge tone="info">FY26 Plan</Badge>
          </div>
          <div className="px-2 pb-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPARE} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="historical" name="Historical" fill="var(--muted-foreground)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="potential" name="Potential" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="goal" name="Proposed Goal" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0">
          <div className="px-5 pt-5 pb-1">
            <div className="text-[14px] font-semibold tracking-tight">Forecast Trajectory</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              12-month rolling forecast vs historical
            </div>
          </div>
          <div className="px-2 pb-2 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={[80, 120]} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="historical" stroke="var(--muted-foreground)" strokeDasharray="4 4" fill="none" strokeWidth={1.5} />
                <Area type="monotone" dataKey="forecast" stroke="var(--chart-1)" fill="url(#gf)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Data Inputs */}
      <Card className="p-0">
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <div className="text-[14px] font-semibold tracking-tight">Data Inputs</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              Source datasets feeding the FY26 plan
            </div>
          </div>
          <Link
            to="/data-inputs"
            className="h-8 px-3 inline-flex items-center gap-2 rounded-md border border-border text-[12px] font-medium hover:bg-muted/50"
          >
            <Upload className="size-3.5" /> Manage inputs
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-5 pb-5">
          {DATASETS.map((d) => {
            const Icon = d.icon;
            const tone =
              d.status === "validated"
                ? "success"
                : d.status === "warning"
                ? "warning"
                : "info";
            const label =
              d.status === "validated"
                ? "Validated"
                : d.status === "warning"
                ? "Needs review"
                : "Pending validation";
            return (
              <div
                key={d.name}
                className="rounded-lg border border-border bg-surface p-4 hover:border-border-strong transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-md bg-primary-muted text-primary grid place-items-center shrink-0">
                    <Icon className="size-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-foreground truncate">
                      {d.name}
                    </div>
                    <div className="text-[11.5px] text-muted-foreground truncate">{d.file}</div>
                  </div>
                  <Badge tone={tone as "success" | "warning" | "info"}>{label}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11.5px] text-muted-foreground">
                  <span>{d.rows}</span>
                  <span>Uploaded {d.uploaded}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Goal Setting Workspace */}
      <Card className="p-0">
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <div className="text-[14px] font-semibold tracking-tight">Goal Setting Workspace</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              Territory-level goals · gap-to-potential analysis
            </div>
          </div>
          <Link
            to="/goal-setting"
            className="h-8 px-3 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90"
          >
            Open workspace <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-muted-foreground border-y border-border bg-muted/30">
                <th className="px-5 py-2.5 font-medium">Territory</th>
                <th className="px-5 py-2.5 font-medium">Potential ($M)</th>
                <th className="px-5 py-2.5 font-medium">Goal ($M)</th>
                <th className="px-5 py-2.5 font-medium">Forecast Contribution</th>
                <th className="px-5 py-2.5 font-medium">Gap to Potential</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TERRITORY_GOALS.map((t) => {
                const gap = t.potential - t.goal;
                const gapPct = (gap / t.potential) * 100;
                const isRisk = t.status === "risk";
                const isStretch = t.status === "stretch";
                return (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-5 py-2.5">
                      <div className="font-medium text-foreground">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.id}</div>
                    </td>
                    <td className="px-5 py-2.5 num">${t.potential.toFixed(1)}</td>
                    <td className="px-5 py-2.5 num">${t.goal.toFixed(1)}</td>
                    <td className="px-5 py-2.5 num">{t.contribution}%</td>
                    <td className="px-5 py-2.5 num">
                      <span className={gap < 0 ? "text-warning" : "text-muted-foreground"}>
                        {gap >= 0 ? "+" : ""}
                        {gap.toFixed(1)} ({gapPct.toFixed(0)}%)
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      {isRisk ? (
                        <Badge tone="danger">
                          <AlertTriangle className="size-2.5" /> Unrealistic
                        </Badge>
                      ) : isStretch ? (
                        <Badge tone="warning">Stretch</Badge>
                      ) : (
                        <Badge tone="success">On track</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reports + Plan Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-5">
        <Card className="p-0">
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div>
              <div className="text-[14px] font-semibold tracking-tight">Reports & Outputs</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Goals · MBO · IC Design · Territory · Plan outputs
              </div>
            </div>
            <button className="h-8 px-3 inline-flex items-center gap-2 rounded-md border border-border text-[12px] font-medium hover:bg-muted/50">
              <Download className="size-3.5" /> Export all
            </button>
          </div>
          <div className="divide-y divide-border">
            {REPORTS.map((r) => (
              <div
                key={r.name}
                className="px-5 py-3 flex items-center gap-3 hover:bg-muted/30"
              >
                <div className="size-8 rounded-md bg-muted grid place-items-center shrink-0">
                  <FileText className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground truncate">{r.name}</div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {r.type} · Updated {r.updated} · {r.size} · {r.format}
                  </div>
                </div>
                <button className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-md text-[11.5px] font-medium hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                  <Eye className="size-3.5" /> View
                </button>
                <button className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-md text-[11.5px] font-medium hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                  <Download className="size-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-start justify-between">
              <div>
                <div className="text-[14px] font-semibold tracking-tight">Final Plan Summary</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  FY26 IC Design · ready for distribution
                </div>
              </div>
              <Badge tone="success">
                <CheckCircle2 className="size-2.5" /> Reports Ready
              </Badge>
            </div>
            <div className="px-5 pb-5 space-y-3">
              <SummaryRow label="Final goals" value="$1.38B across 1,247 territories" />
              <SummaryRow label="Territory allocation" value="12 regions · 96 manager spans" />
              <SummaryRow label="Forecast" value="+11.3% vs FY25 · 94.6% achievement potential" />
              <SummaryRow
                label="Key assumptions"
                value="Blended 60/40 historical/potential · 8% market growth"
              />
              <SummaryRow label="Report generation" value="6 of 6 reports generated" tone="success" />
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-start justify-between">
              <div>
                <div className="text-[14px] font-semibold tracking-tight">Roadmap</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">Upcoming capabilities</div>
              </div>
              <Rocket className="size-4 text-muted-foreground" />
            </div>
            <div className="divide-y divide-border">
              {ROADMAP.map((r) => (
                <div key={r.title} className="px-5 py-3 flex items-center gap-3">
                  <StatusDot tone="info" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-foreground">{r.title}</div>
                  </div>
                  <Badge tone="neutral">{r.quarter}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink to="/data-inputs" icon={Database} label="Data Inputs" />
        <QuickLink to="/plan-builder" icon={ClipboardList} label="Plan Builder" />
        <QuickLink to="/goal-setting" icon={Target} label="Goal Setting" />
        <QuickLink to="/payout-curve" icon={TrendingUp} label="Payout Curves" />
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success";
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-[12.5px]">
      <div className="text-muted-foreground">{label}</div>
      <div className={`text-right font-medium ${tone === "success" ? "text-success" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 hover:border-border-strong hover:bg-muted/30 transition-all"
    >
      <div className="size-8 rounded-md bg-primary-muted text-primary grid place-items-center">
        <Icon className="size-4" />
      </div>
      <div className="flex-1 text-[13px] font-medium">{label}</div>
      <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl bg-white/8 backdrop-blur border border-white/10 p-3.5">
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-primary-foreground/60 font-medium">
        {label}
      </div>
      <div className="mt-1 text-[22px] font-semibold tracking-tight num">{value}</div>
      <div className="text-[11px] text-primary-foreground/60 mt-0.5">{hint}</div>
    </div>
  );
}
