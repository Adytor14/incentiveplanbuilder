import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, StatusDot } from "@/components/ui-kit";
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  GitCompareArrows,
  MessageSquare,
  ShieldCheck,
  Send,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/approval")({
  head: () => ({
    meta: [
      { title: "Final Approval · Helix IC" },
      { name: "description", content: "Executive review and approval workflow for the FY26 IC plan." },
    ],
  }),
  component: Approval,
});

const APPROVERS = [
  { name: "Shreya Mehta", role: "HQ · IC Admin", state: "approved", when: "Today 09:14", initials: "SM" },
  { name: "Rajat Iyer", role: "VP, Sales Strategy", state: "approved", when: "Today 11:32", initials: "RI" },
  { name: "Linda Park", role: "BU Head, Specialty Onc", state: "pending", when: "Awaiting review", initials: "LP" },
  { name: "Daniel Cho", role: "CFO Office", state: "queued", when: "Queued", initials: "DC" },
  { name: "Marcus Hill", role: "President, Commercial", state: "queued", when: "Queued", initials: "MH" },
];

const VERSIONS = [
  { metric: "Total IC Budget", v23: "$64.8M", v24: "$66.5M", delta: "+$1.7M", up: true },
  { metric: "% Reps Hitting Target", v23: "58.1%", v24: "61.4%", delta: "+3.3pp", up: true },
  { metric: "Std Deviation", v23: "21.4", v24: "18.2", delta: "−3.2", up: true },
  { metric: "Budget Overrun Risk", v23: "22%", v24: "14%", delta: "−8pp", up: true },
  { metric: "Fairness Score", v23: "78", v24: "87", delta: "+9", up: true },
];

const COMMENTS = [
  { who: "Rajat Iyer", role: "VP Sales Strategy", when: "1 hr ago", text: "Aligned. The blended methodology is the right call — addresses my prior concerns about the West region underweighting.", initials: "RI" },
  { who: "Linda Park", role: "BU Head", when: "Yesterday", text: "Want to validate the Synaxen launch booster against access-readiness data before sign-off. Loop in market access?", initials: "LP" },
  { who: "Shreya Mehta", role: "IC Admin", when: "Yesterday", text: "Run #14 reduced budget overrun from 22% to 14%. Cap moved from 175% to 150%.", initials: "SM" },
];

function Approval() {
  return (
    <div>
      <PageHeader
        step={7}
        eyebrow="Executive Review Room"
        title="Final Approval Dashboard"
        description="Executive-grade summary of the FY26 plan. Compare versions, capture sign-offs, and launch with confidence."
        prev={{ to: "/fairness", label: "Fairness" }}
        actions={
          <>
            <button className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[13px] font-medium hover:bg-muted">
              <FileCheck2 className="size-3.5" /> Export PDF
            </button>
            <button className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md bg-success text-success-foreground text-[13px] font-semibold hover:opacity-90 shadow-elevated">
              <Send className="size-3.5" /> Submit for Final Sign-off
            </button>
          </>
        }
      />
      <div className="px-8 py-7 max-w-[1600px] space-y-6">
        {/* Executive summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <ExecCard icon={DollarSign} label="Total IC Budget" value="$66.5M" sub="+4.2% vs FY25" tone="primary" />
          <ExecCard icon={ShieldCheck} label="Plan Health" value="87 / 100" sub="A− · Healthy" tone="success" />
          <ExecCard icon={Activity} label="Simulation Risk" value="14%" sub="Budget overrun probability" tone="info" />
          <ExecCard icon={TrendingUp} label="Decision Confidence" value="High" sub="10K runs · low variance" tone="success" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
          <div className="space-y-5">
            {/* Plan summary */}
            <Card className="p-0">
              <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold tracking-tight">Plan Summary</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">FY26 Specialty Oncology BU · v2.4 Draft</div>
                </div>
                <Badge tone="primary">Ready for review</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-5">
                  <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-3">Coverage</div>
                  <Row icon={Users} label="Eligible reps" value="1,247" />
                  <Row icon={Users} label="RBMs / ASMs" value="84 / 12" />
                  <Row icon={TrendingUp} label="Roles configured" value="3 of 3" tone="success" />
                  <Row icon={CheckCircle2} label="Components defined" value="11 components" />
                </div>
                <div className="p-5">
                  <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-3">Mechanics</div>
                  <Row icon={Activity} label="Goal methodology" value="Blended (60/40)" />
                  <Row icon={TrendingUp} label="Payout curve" value="80 / 100 / 110 / 130 / 150" />
                  <Row icon={ShieldCheck} label="Fairness score" value="87 / 100" tone="success" />
                  <Row icon={Activity} label="Simulations run" value="10,000 (run #14)" />
                </div>
              </div>
            </Card>

            {/* Version comparison */}
            <Card className="p-0">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
                <div>
                  <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                    <GitCompareArrows className="size-3.5" /> Version Comparison
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">Current draft vs. previously circulated v2.3</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">v2.3 · Apr 14</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge tone="primary">v2.4 · Today</Badge>
                </div>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground bg-muted/40">
                    <th className="text-left font-medium px-5 py-2.5">Metric</th>
                    <th className="text-right font-medium px-5 py-2.5">v2.3</th>
                    <th className="text-right font-medium px-5 py-2.5">v2.4 (current)</th>
                    <th className="text-right font-medium px-5 py-2.5 pr-6">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {VERSIONS.map((v) => (
                    <tr key={v.metric}>
                      <td className="px-5 py-3 font-medium">{v.metric}</td>
                      <td className="px-5 py-3 text-right num text-muted-foreground">{v.v23}</td>
                      <td className="px-5 py-3 text-right num font-semibold">{v.v24}</td>
                      <td className={`px-5 py-3 text-right num font-medium pr-6 ${v.up ? "text-success" : "text-destructive"}`}>{v.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Comments */}
            <Card className="p-0">
              <div className="px-5 pt-5 pb-3 border-b border-border">
                <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                  <MessageSquare className="size-3.5" /> Discussion
                </div>
                <div className="text-[12px] text-muted-foreground mt-0.5">3 comments from approvers</div>
              </div>
              <div className="divide-y divide-border">
                {COMMENTS.map((c, i) => (
                  <div key={i} className="px-5 py-4 flex gap-3">
                    <div className="size-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-info text-primary-foreground grid place-items-center text-[11px] font-semibold">
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-[12.5px] font-semibold">{c.who}</div>
                        <div className="text-[11px] text-muted-foreground">{c.role}</div>
                        <div className="text-[11px] text-muted-foreground ml-auto">{c.when}</div>
                      </div>
                      <div className="text-[12.5px] text-foreground mt-1 leading-relaxed">{c.text}</div>
                    </div>
                  </div>
                ))}
                <div className="px-5 py-4 flex gap-3 bg-muted/20">
                  <div className="size-8 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center text-[11px] font-semibold">SM</div>
                  <div className="flex-1 flex items-center gap-2">
                    <input placeholder="Add a comment for the approval thread…" className="flex-1 h-9 rounded-md border border-border bg-surface px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary" />
                    <button className="h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium hover:bg-primary/90">Send</button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Approval tracker */}
          <div className="space-y-5">
            <Card className="p-0">
              <div className="px-5 pt-5 pb-3 border-b border-border">
                <div className="text-[14px] font-semibold tracking-tight">Approval Workflow</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">2 of 5 approvals received</div>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-success to-primary" style={{ width: "40%" }} />
                </div>
              </div>
              <div className="p-3 space-y-1">
                {APPROVERS.map((a, i) => {
                  const isApproved = a.state === "approved";
                  const isPending = a.state === "pending";
                  return (
                    <div key={i} className={`p-3 rounded-md flex items-center gap-3 ${isPending ? "bg-primary-muted/30 border border-primary/20" : ""}`}>
                      <div className={`size-9 rounded-full grid place-items-center text-[11px] font-semibold ${isApproved ? "bg-success text-success-foreground" : isPending ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {isApproved ? <CheckCircle2 className="size-4" /> : a.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-medium truncate">{a.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{a.role}</div>
                      </div>
                      <div className="text-right">
                        <Badge tone={isApproved ? "success" : isPending ? "primary" : "neutral"}>
                          {isApproved ? "Approved" : isPending ? <><Clock className="size-2.5" /> Pending</> : "Queued"}
                        </Badge>
                        <div className="text-[10.5px] text-muted-foreground mt-0.5">{a.when}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-3">Decision Confidence</div>
              <div className="space-y-3">
                <Confidence label="Plan completeness" pct={100} tone="success" />
                <Confidence label="Simulation coverage" pct={92} tone="success" />
                <Confidence label="Fairness validation" pct={87} tone="success" />
                <Confidence label="Stakeholder alignment" pct={62} tone="warning" />
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="text-[12px] text-muted-foreground">Composite</div>
                <div className="text-[20px] font-semibold tracking-tight num text-success">85.3</div>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-primary to-[oklch(0.32_0.13_262)] text-primary-foreground border-0">
              <div className="text-[11px] uppercase tracking-[0.08em] text-primary-foreground/70 font-semibold">Launch Readiness</div>
              <div className="mt-2 text-[20px] font-semibold tracking-tight">FY26 plan is on track for April 28 launch.</div>
              <div className="mt-1 text-[12px] text-primary-foreground/80">3 approvals remaining · est. 2 business days.</div>
              <button className="mt-4 w-full h-10 rounded-md bg-white text-primary text-[13px] font-semibold hover:bg-white/90">
                View launch checklist
              </button>
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
          <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">{label}</div>
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
      <div className={`text-[13px] font-semibold num ${tone === "success" ? "text-success" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Confidence({ label, pct, tone }: { label: string; pct: number; tone: "success" | "warning" }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[12px] text-muted-foreground">{label}</div>
        <div className="text-[12.5px] font-semibold num">{pct}%</div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${tone === "success" ? "bg-success" : "bg-warning"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
