import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import { ShieldCheck, AlertTriangle, CheckCircle2, AlertCircle, ArrowRight, TrendingUp, Users, MapPin, GitCompare, Sigma } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

export const Route = createFileRoute("/fairness")({
  head: () => ({
    meta: [
      { title: "Fairness Testing · Helix IC" },
      { name: "description", content: "Validate whether goals are equitable and achievable across reps and territories." },
    ],
  }),
  component: Fairness,
});

type Severity = "healthy" | "caution" | "warning";

const SEV_META: Record<Severity, { label: string; tone: "success" | "warning" | "danger"; Icon: typeof CheckCircle2 }> = {
  healthy: { label: "Healthy", tone: "success", Icon: CheckCircle2 },
  caution: { label: "Caution", tone: "warning", Icon: AlertCircle },
  warning: { label: "Action needed", tone: "danger", Icon: AlertTriangle },
};

// Test 1 — Goal Attainment Distribution
const attainmentDist = [
  { bucket: "<60%", count: 0 },
  { bucket: "60–80%", count: 2 },
  { bucket: "80–100%", count: 5 },
  { bucket: "100–120%", count: 5 },
  { bucket: "120–150%", count: 3 },
  { bucket: ">150%", count: 0 },
];

// Test 3 — Top vs Bottom Performer Analysis
const topBottom = [
  { group: "Top 20%", lyAttain: 128, newAttain: 102 },
  { group: "Bottom 20%", lyAttain: 71, newAttain: 99 },
];

// Test 4 — High vs Low Potential Territories
const potentialBuckets = [
  { group: "High Potential", goalDifficulty: 92, expectedAttain: 96 },
  { group: "Low Potential", goalDifficulty: 118, expectedAttain: 82 },
];

function Fairness() {
  return (
    <div>
      <PageHeader
        step={4}
        title="Fairness Testing"
        description="Validate whether goals are equitable and achievable before designing the payout curve."
        prev={{ to: "/goal-setting", label: "Goal Setting" }}
        next={{ to: "/payout-curve", label: "Payout Curve" }}
      />
      <div className="px-8 py-7 max-w-[1600px] grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          {/* Test 1 */}
          <TestCard
            icon={TrendingUp}
            number={1}
            title="Goal Attainment Distribution"
            subtitle="Previous Sales vs New Goals"
            severity="healthy"
            insight="Distribution is roughly bell-shaped with the bulk between 80% and 120%. Goals appear reasonably calibrated overall."
          >
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attainmentDist} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {attainmentDist.map((d, i) => (
                      <Cell key={i} fill={d.bucket.includes(">") || d.bucket.includes("<") ? "var(--warning)" : "var(--chart-1)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TestCard>

          {/* Test 2 */}
          <TestCard
            icon={Sigma}
            number={2}
            title="Goal Growth %"
            subtitle="How much goals grew vs prior year"
            severity="caution"
            insight="Median growth (12%) is below the average (15.2%), indicating a long tail of reps with very high goal growth (>30%). Review outliers."
          >
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Average Growth" value="15.2%" tone="primary" />
              <Stat label="Median Growth" value="12.0%" tone="info" />
              <Stat label="P90 Growth" value="34.5%" tone="warning" />
            </div>
          </TestCard>

          {/* Test 3 */}
          <TestCard
            icon={Users}
            number={3}
            title="Top vs Bottom Performer Analysis"
            subtitle="Compare expected attainment by historical performance"
            severity="warning"
            insight="High performers (Top 20%) and low performers (Bottom 20%) are projected to land at nearly identical attainment (~100%). High performers may be receiving easier goals while low performers are receiving harder ones."
            recommendation={["Decrease Historical Sales Weight", "Increase Territory Potential Weight"]}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBottom} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="group" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="lyAttain" name="LY Attainment" fill="var(--muted-foreground)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="newAttain" name="Expected New Attainment" fill="var(--warning)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TestCard>

          {/* Test 4 */}
          <TestCard
            icon={MapPin}
            number={4}
            title="High vs Low Potential Territories"
            subtitle="Goal difficulty and expected attainment by territory potential"
            severity="warning"
            insight="Low-potential territories are receiving disproportionately difficult goals (118% difficulty index vs 92% in high-potential). Expected attainment gap is 14 points."
            recommendation={["Increase Territory Potential Weight", "Review goal allocation in low-potential geographies"]}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={potentialBuckets} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="group" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="goalDifficulty" name="Goal Difficulty Index" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="expectedAttain" name="Expected Attainment" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TestCard>

          {/* Test 5 */}
          <TestCard
            icon={GitCompare}
            number={5}
            title="Goal Similarity Test"
            subtitle="Variance across rep-level goals"
            severity="caution"
            insight="Goal coefficient of variation is 0.09 — goals are quite similar across reps. This may reflect over-reliance on equal distribution at the expense of differentiated territory plans."
            recommendation={["Reduce Equal Distribution Weight", "Increase performance-based allocation"]}
          >
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Variance" value="$48K²" tone="info" />
              <Stat label="Std Deviation" value="±$22K" tone="info" />
              <Stat label="CoV" value="0.09" tone="warning" />
            </div>
          </TestCard>
        </div>

        {/* Recommendations panel */}
        <aside className="space-y-4">
          <Card className="p-0 sticky top-20">
            <div className="px-5 pt-5 pb-3 border-b border-border flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <div>
                <div className="text-[14px] font-semibold tracking-tight">Fairness Recommendations</div>
                <div className="text-[11.5px] text-muted-foreground mt-0.5">Auto-generated from test results</div>
              </div>
            </div>
            <ul className="px-5 py-4 space-y-2.5 text-[12.5px]">
              <RecItem tone="danger" text="Decrease Historical Sales Weight (currently overweighted)" />
              <RecItem tone="danger" text="Increase Territory Potential Weight" />
              <RecItem tone="warning" text="Reduce Equal Distribution Weight" />
              <RecItem tone="warning" text="Rebalance Goals Across Territories" />
              <RecItem tone="info" text="Review High-Potential Territories outliers" />
            </ul>
            <div className="px-5 py-3 border-t border-border">
              <a
                href="/goal-setting"
                className="h-9 w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-semibold hover:bg-primary/90"
              >
                Back to Goal Setting <ArrowRight className="size-3.5" />
              </a>
            </div>
          </Card>

          <div className="rounded-lg border border-border bg-surface p-4 text-[12px] text-muted-foreground">
            Fairness Testing runs <span className="text-foreground font-medium">before</span> Payout Curve Design — validate the goals first so payouts are built on equitable targets.
          </div>
        </aside>
      </div>
    </div>
  );
}

function TestCard({
  icon: Icon, number, title, subtitle, severity, insight, recommendation, children,
}: {
  icon: typeof CheckCircle2; number: number; title: string; subtitle: string;
  severity: Severity; insight: string; recommendation?: string[]; children: React.ReactNode;
}) {
  const meta = SEV_META[severity];
  const SevIcon = meta.Icon;
  return (
    <Card className="p-0">
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3 border-b border-border">
        <div className="flex items-start gap-3 min-w-0">
          <div className="size-9 rounded-lg bg-primary-muted text-primary grid place-items-center shrink-0">
            <Icon className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Test {number}</span>
            </div>
            <div className="text-[14.5px] font-semibold tracking-tight">{title}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</div>
          </div>
        </div>
        <Badge tone={meta.tone}><SevIcon className="size-3" /> {meta.label}</Badge>
      </div>
      <div className="px-5 py-4">{children}</div>
      <div className="px-5 py-3 border-t border-border bg-muted/30 text-[12.5px] text-foreground">
        <span className="font-semibold">Insight: </span>{insight}
      </div>
      {recommendation && (
        <div className="px-5 py-3 border-t border-border bg-warning/5">
          <div className="text-[10.5px] uppercase tracking-[0.06em] text-warning font-semibold mb-1.5">
            Recommended Actions
          </div>
          <ul className="text-[12.5px] text-foreground space-y-1 list-disc pl-5">
            {recommendation.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "primary" | "info" | "warning" }) {
  const toneCls = { primary: "text-primary", info: "text-info", warning: "text-warning" }[tone];
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2.5">
      <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium">{label}</div>
      <div className={`text-[18px] font-semibold tracking-tight num ${toneCls}`}>{value}</div>
    </div>
  );
}

function RecItem({ tone, text }: { tone: "danger" | "warning" | "info"; text: string }) {
  const dotCls = { danger: "bg-destructive", warning: "bg-warning", info: "bg-info" }[tone];
  return (
    <li className="flex items-start gap-2.5">
      <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${dotCls}`} />
      <span>{text}</span>
    </li>
  );
}
