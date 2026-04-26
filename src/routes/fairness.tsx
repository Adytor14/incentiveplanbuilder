import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, StatusDot } from "@/components/ui-kit";
import { ShieldCheck, AlertTriangle, TrendingDown, Users, MapPin, Filter } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from "recharts";

export const Route = createFileRoute("/fairness")({
  head: () => ({
    meta: [
      { title: "Fairness Testing · Helix IC" },
      { name: "description", content: "Validate target fairness across reps, regions and roles before launch." },
    ],
  }),
  component: Fairness,
});

const histogram = [
  { bucket: "<60%", count: 22, tone: "destructive" },
  { bucket: "60–70%", count: 58, tone: "warning" },
  { bucket: "70–80%", count: 124, tone: "warning" },
  { bucket: "80–90%", count: 198, tone: "info" },
  { bucket: "90–100%", count: 312, tone: "success" },
  { bucket: "100–110%", count: 286, tone: "success" },
  { bucket: "110–125%", count: 168, tone: "success" },
  { bucket: "125–150%", count: 64, tone: "info" },
  { bucket: ">150%", count: 15, tone: "warning" },
];

const regions = [
  { name: "Northeast", reps: 218, healthy: 88, attain: 104, spread: 14, status: "success" as const },
  { name: "Southeast", reps: 196, healthy: 82, attain: 101, spread: 16, status: "success" as const },
  { name: "Midwest", reps: 248, healthy: 79, attain: 99, spread: 17, status: "info" as const },
  { name: "Southwest", reps: 182, healthy: 71, attain: 96, spread: 21, status: "warning" as const },
  { name: "West", reps: 264, healthy: 68, attain: 94, spread: 24, status: "warning" as const },
  { name: "Pacific NW", reps: 139, healthy: 84, attain: 103, spread: 13, status: "success" as const },
];

const scatter = Array.from({ length: 90 }, (_, i) => ({
  potential: 60 + Math.random() * 80,
  attainment: 70 + Math.random() * 60 + (Math.random() - 0.5) * 20,
  size: 100 + Math.random() * 200,
}));

const outliers = [
  { rep: "K. Brennan", region: "West", target: "$1.86M", attain: 52, issue: "Target +38% vs peers", sev: "danger" as const },
  { rep: "M. García", region: "Southwest", target: "$1.92M", attain: 58, issue: "New territory, no LY actuals", sev: "warning" as const },
  { rep: "A. Tanaka", region: "West", target: "$0.74M", attain: 188, issue: "Target appears underset", sev: "warning" as const },
  { rep: "R. Okafor", region: "Southeast", target: "$1.42M", attain: 64, issue: "Product A access restricted", sev: "warning" as const },
];

function Fairness() {
  return (
    <div>
      <PageHeader
        step={6}
        eyebrow="Leadership Decision Screen"
        title="Fairness Testing Dashboard"
        description="Validate that targets are achievable and equitable across reps, regions and roles before approval."
        prev={{ to: "/payout-curve", label: "Payout Curve" }}
        next={{ to: "/approval", label: "Final Approval" }}
        actions={
          <button className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[13px] font-medium hover:bg-muted">
            <Filter className="size-3.5" /> Filter
          </button>
        }
      />
      <div className="px-8 py-7 max-w-[1600px] space-y-6">
        {/* Health hero */}
        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr]">
            <div className="p-7 bg-gradient-to-br from-success/15 via-success/5 to-transparent border-b lg:border-b-0 lg:border-r border-border">
              <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Plan Health Score</div>
              <div className="mt-3 flex items-end gap-3">
                <div className="text-[64px] leading-none font-semibold tracking-tight num text-success">87</div>
                <div className="pb-2">
                  <Badge tone="success">A−</Badge>
                  <div className="text-[12px] text-muted-foreground mt-1">/ 100 · Healthy</div>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-success via-success to-info" style={{ width: "87%" }} />
              </div>
              <div className="mt-2 flex justify-between text-[10.5px] text-muted-foreground"><span>Poor</span><span>Excellent</span></div>
              <div className="mt-5 flex items-start gap-2 text-[12px] text-foreground">
                <ShieldCheck className="size-4 text-success shrink-0 mt-0.5" />
                <span>Above the 80-point launch threshold. Two regions flagged for attention.</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
              <Metric label="% Reps >100%" value="61.4%" tone="success" target="55–65% target" />
              <Metric label="% Reps <80%" value="16.4%" tone="info" target="<20% target" />
              <Metric label="Std Deviation" value="18.2" tone="success" target="<22 target" />
              <Metric label="Difficulty Spread" value="0.31" tone="warning" target="<0.25 target" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Distribution */}
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <div className="text-[14px] font-semibold tracking-tight">Attainment Distribution</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">1,247 reps across forecasted attainment buckets</div>
            </div>
            <div className="px-2 pt-4 pb-2 h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogram} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10.5, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} angle={-12} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {histogram.map((h, i) => (
                      <Cell key={i} fill={`var(--${h.tone})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Scatter — target difficulty vs attainment */}
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <div className="text-[14px] font-semibold tracking-tight">Target Difficulty vs. Projected Attainment</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Outliers indicate unfair target-setting</div>
            </div>
            <div className="px-2 pt-4 pb-2 h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 24, bottom: 25, left: 10 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="potential" name="potential" domain={[40, 160]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} label={{ value: "Territory potential index", position: "bottom", offset: 5, fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis type="number" dataKey="attainment" name="attainment" domain={[50, 160]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <ZAxis type="number" dataKey="size" range={[40, 200]} />
                  <ReferenceLine y={100} stroke="var(--primary)" strokeDasharray="4 4" />
                  <ReferenceLine y={80} stroke="var(--warning)" strokeDasharray="4 4" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Scatter data={scatter} fill="var(--chart-1)" fillOpacity={0.55} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Regional fairness */}
        <Card className="p-0">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
            <div>
              <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                <MapPin className="size-3.5" /> Regional Fairness
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Equity across 6 regions · click a region to drill down</div>
            </div>
            <Badge tone="warning"><AlertTriangle className="size-3" /> 2 regions need attention</Badge>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground bg-muted/40">
                <th className="text-left font-medium px-5 py-2.5">Region</th>
                <th className="text-right font-medium px-5 py-2.5">Reps</th>
                <th className="text-right font-medium px-5 py-2.5">Healthy %</th>
                <th className="text-left font-medium px-5 py-2.5 w-[300px]">Distribution</th>
                <th className="text-right font-medium px-5 py-2.5">Avg Attainment</th>
                <th className="text-right font-medium px-5 py-2.5">Spread (σ)</th>
                <th className="text-right font-medium px-5 py-2.5 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {regions.map((r) => (
                <tr key={r.name} className="hover:bg-muted/30 cursor-pointer">
                  <td className="px-5 py-3.5 font-medium">{r.name}</td>
                  <td className="px-5 py-3.5 text-right num text-muted-foreground">{r.reps}</td>
                  <td className="px-5 py-3.5 text-right num font-medium">{r.healthy}%</td>
                  <td className="px-5 py-3.5">
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
                      <div className="bg-destructive" style={{ width: `${(100 - r.healthy) * 0.6}%` }} />
                      <div className="bg-warning" style={{ width: `${(100 - r.healthy) * 0.4}%` }} />
                      <div className="bg-success" style={{ width: `${r.healthy}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right num font-medium">{r.attain}%</td>
                  <td className="px-5 py-3.5 text-right num text-muted-foreground">±{r.spread}</td>
                  <td className="px-5 py-3.5 text-right pr-6">
                    <Badge tone={r.status}>
                      <StatusDot tone={r.status} />
                      {r.status === "success" ? "Healthy" : r.status === "warning" ? "Review" : "Monitor"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Outliers */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
              <div>
                <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                  <TrendingDown className="size-3.5 text-destructive" /> Outlier Detection
                </div>
                <div className="text-[12px] text-muted-foreground mt-0.5">Reps whose targets fall outside fairness tolerances</div>
              </div>
              <button className="text-[12px] font-medium text-primary">Resolve all</button>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground bg-muted/40">
                  <th className="text-left font-medium px-5 py-2.5">Rep</th>
                  <th className="text-left font-medium px-5 py-2.5">Region</th>
                  <th className="text-right font-medium px-5 py-2.5">Target</th>
                  <th className="text-right font-medium px-5 py-2.5">Proj. Attain.</th>
                  <th className="text-left font-medium px-5 py-2.5">Issue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {outliers.map((o) => (
                  <tr key={o.rep} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{o.rep}</td>
                    <td className="px-5 py-3 text-muted-foreground">{o.region}</td>
                    <td className="px-5 py-3 text-right num">{o.target}</td>
                    <td className={`px-5 py-3 text-right num font-semibold ${o.attain < 80 ? "text-destructive" : "text-warning"}`}>{o.attain}%</td>
                    <td className="px-5 py-3"><Badge tone={o.sev === "danger" ? "danger" : "warning"}>{o.issue}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                <Users className="size-3.5" /> Role-Based Fairness
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Equity across role tiers</div>
            </div>
            <div className="p-5 space-y-4">
              {[
                { role: "Sales Rep (1,247)", score: 87, tone: "success" as const },
                { role: "RBM (84)", score: 91, tone: "success" as const },
                { role: "Area Sales Manager (12)", score: 79, tone: "warning" as const },
              ].map((r) => (
                <div key={r.role}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[12.5px] font-medium">{r.role}</div>
                    <Badge tone={r.tone}>{r.score} / 100</Badge>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${r.tone === "success" ? "bg-success" : "bg-warning"}`} style={{ width: `${r.score}%` }} />
                  </div>
                </div>
              ))}
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 mt-4 flex gap-2.5">
                <AlertTriangle className="size-4 text-warning-foreground shrink-0 mt-0.5" />
                <div className="text-[11.5px]">
                  <span className="font-medium">ASM tier needs review.</span> Two managers project below 80% attainment under base-case assumptions.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone, target }: any) {
  const c = { success: "text-success", warning: "text-warning-foreground", info: "text-info", danger: "text-destructive" }[tone as string];
  return (
    <div className="p-5">
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">{label}</div>
      <div className={`mt-1.5 text-[26px] font-semibold tracking-tight num ${c}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{target}</div>
    </div>
  );
}
