import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import {
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  Download,
  Send,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Activity,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/approval")({
  head: () => ({
    meta: [
      { title: "Plan Summary · IC Design" },
      {
        name: "description",
        content: "Read-only summary of the designed IC plan with downloadable reports.",
      },
    ],
  }),
  component: PlanSummary,
});

const REPORTS = [
  { name: "Goal Report", description: "Rep / territory goals with component breakdown", format: "XLSX" },
  { name: "MBO Report", description: "MBO catalog with weights and definitions", format: "XLSX" },
  { name: "Payout Curve Report", description: "All inflexion points and payout schedule", format: "PDF" },
  { name: "Plan Design Summary", description: "Executive summary of the full plan", format: "PDF" },
];

function PlanSummary() {
  return (
    <div>
      <PageHeader
        step={6}
        eyebrow="Plan Summary"
        title="Plan Summary & Export"
        description="Read-only snapshot of the designed plan. Download the full report or hand off to IC Admin."
        prev={{ to: "/fairness", label: "Fairness Testing" }}
        actions={
          <>
            <button className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[13px] font-medium hover:bg-muted">
              <FileCheck2 className="size-3.5" /> Download PDF
            </button>
            <button
              className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md bg-muted text-muted-foreground text-[13px] font-semibold cursor-not-allowed"
              title="Coming soon"
              disabled
            >
              <Send className="size-3.5" /> Export to IC Admin
              <Badge tone="neutral" className="ml-1">
                <Clock className="size-2.5" /> Soon
              </Badge>
            </button>
          </>
        }
      />
      <div className="px-8 py-7 max-w-[1600px] space-y-6">
        {/* Executive summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <ExecCard icon={DollarSign} label="Total IC Budget" value="$66.5M" sub="+4.2% vs FY25" tone="primary" />
          <ExecCard icon={Users} label="Reps Eligible" value="1,247" sub="84 RBMs · 12 ASMs" tone="info" />
          <ExecCard icon={Target} label="Total Goal" value="$1.42B" sub="+15.2% YoY" tone="success" />
          <ExecCard icon={Activity} label="Curve Inflexion Pts" value="4" sub="80 / 100 / 110 / 150" tone="info" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
          <div className="space-y-5">
            {/* Plan summary */}
            <Card className="p-0">
              <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold tracking-tight">Plan Composition</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    FY26 Specialty Oncology BU · v2.4 Draft
                  </div>
                </div>
                <Badge tone="primary">Read-only</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-5">
                  <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-3">
                    Goals
                  </div>
                  <Row icon={Target} label="Methodology" value="Blended (3-Component)" />
                  <Row icon={Activity} label="Historical / Potential / Equal" value="50 / 30 / 20" />
                  <Row icon={TrendingUp} label="Growth factor" value="+15%" />
                  <Row icon={CheckCircle2} label="Historical period" value="FY25 Full Year" />
                </div>
                <div className="p-5">
                  <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-3">
                    Plan Components
                  </div>
                  <Row icon={Activity} label="Components" value="Goal Attainment + MBOs" />
                  <Row icon={TrendingUp} label="Payout curve" value="80 / 100 / 110 / 150" />
                  <Row icon={CheckCircle2} label="MBO count" value="12 from IC Admin" />
                  <Row icon={Users} label="Roles configured" value="3 of 3" tone="success" />
                </div>
              </div>
            </Card>

            {/* Reports */}
            <Card className="p-0">
              <div className="px-5 pt-5 pb-3 border-b border-border">
                <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                  <FileSpreadsheet className="size-3.5" /> Output Reports
                </div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  Download any of the artifacts produced by the plan.
                </div>
              </div>
              <div className="divide-y divide-border">
                {REPORTS.map((r) => (
                  <div key={r.name} className="px-5 py-3.5 flex items-center gap-4">
                    <div className="size-9 rounded-lg bg-muted/60 grid place-items-center">
                      <FileSpreadsheet className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate">{r.name}</div>
                      <div className="text-[11.5px] text-muted-foreground truncate">
                        {r.description}
                      </div>
                    </div>
                    <Badge tone="neutral">{r.format}</Badge>
                    <button className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[12px] font-medium hover:bg-muted">
                      <Download className="size-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Roadmap */}
          <div className="space-y-5">
            <Card className="p-0">
              <div className="px-5 pt-5 pb-3 border-b border-border">
                <div className="text-[14px] font-semibold tracking-tight">Roadmap</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  Coming to IC Design in upcoming releases.
                </div>
              </div>
              <div className="p-3 space-y-1">
                {[
                  "IC Design → IC Admin handoff",
                  "Submit to IC Admin workflow",
                  "Multi-stage approval workflow",
                  "Plan Health Optimization",
                  "Optimization engine",
                ].map((t) => (
                  <div
                    key={t}
                    className="px-3 py-2.5 rounded-md flex items-center justify-between text-[12.5px]"
                  >
                    <span className="text-foreground">{t}</span>
                    <Badge tone="neutral">
                      <Clock className="size-2.5" /> Planned
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-primary to-[oklch(0.32_0.13_262)] text-primary-foreground border-0">
              <div className="text-[11px] uppercase tracking-[0.08em] text-primary-foreground/70 font-semibold">
                Plan Status
              </div>
              <div className="mt-2 text-[20px] font-semibold tracking-tight">
                FY26 plan design is complete.
              </div>
              <div className="mt-1 text-[12px] text-primary-foreground/80">
                All datasets validated, goals balanced, payout curve defined.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecCard({ icon: Icon, label, value, sub, tone }: any) {
  const map: any = {
    primary: { bg: "bg-primary-muted", text: "text-primary" },
    success: { bg: "bg-success/10", text: "text-success" },
    info: { bg: "bg-info/10", text: "text-info" },
  };
  const c = map[tone];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
            {label}
          </div>
          <div className="mt-1.5 text-[26px] font-semibold tracking-tight num">{value}</div>
          <div className="text-[11.5px] text-muted-foreground mt-0.5">{sub}</div>
        </div>
        <div className={`size-10 rounded-lg grid place-items-center ${c.bg}`}>
          <Icon className={`size-4.5 ${c.text}`} />
        </div>
      </div>
    </Card>
  );
}

function Row({ icon: Icon, label, value, tone }: any) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div
        className={`text-[13px] font-semibold num ${
          tone === "success" ? "text-success" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
