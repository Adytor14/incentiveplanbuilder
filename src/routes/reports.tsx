import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import { FileText, Eye, Download, FileSpreadsheet, FileType, CheckCircle2 } from "lucide-react";
import { usePlanPeriod } from "@/lib/plan-period";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Outputs · Helix IC" },
      { name: "description", content: "Final plan reports and exports — goals, territory, MBO, compensation, payout and IC design." },
    ],
  }),
  component: Reports,
});

type Report = { id: string; name: string; description: string; type: string; rows: number };

const REPORTS: Report[] = [
  { id: "goal", name: "Goal Report", description: "Rep, territory, region and national goals", type: "Goals", rows: 15 },
  { id: "territory", name: "Territory Report", description: "Territory-level potential, goals and assignment", type: "Territory", rows: 15 },
  { id: "mbo", name: "MBO Report", description: "MBO definitions, weights and targets by role", type: "MBO", rows: 36 },
  { id: "comp", name: "Compensation Summary", description: "Role-level target pay and total comp roll-up", type: "Compensation", rows: 15 },
  { id: "payout", name: "Payout Report", description: "Payout curve, inflexion points and expected payouts", type: "Payout", rows: 5 },
  { id: "ic", name: "IC Design Report", description: "Full plan design summary with assumptions and methodology", type: "IC Design", rows: 1 },
];

function Reports() {
  const { period } = usePlanPeriod();
  const [toast, setToast] = useState<string | null>(null);

  const fire = (label: string) => {
    setToast(label);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div>
      <PageHeader
        step={6}
        title="Reports & Outputs"
        description={`Final reports for IC Plan ${period}. View any report inline or export to PDF / Excel.`}
        prev={{ to: "/payout-curve", label: "Payout Curve" }}
      />
      <div className="px-8 py-7 max-w-[1400px] space-y-5">
        <Card className="p-5 bg-success/5 border-success/30 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-success/15 text-success grid place-items-center">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold">Plan ready for distribution</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              All workflow steps completed for {period}. Use the actions below to view or export.
            </div>
          </div>
          <Badge tone="success">{period}</Badge>
        </Card>

        <Card className="p-0">
          <div className="px-5 pt-5 pb-3 border-b border-border flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <div className="text-[14px] font-semibold tracking-tight">Available Reports</div>
          </div>
          <div className="divide-y divide-border">
            {REPORTS.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center gap-4">
                <div className="size-10 rounded-lg bg-primary-muted text-primary grid place-items-center shrink-0">
                  <FileText className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[13.5px] font-semibold truncate">{r.name}</div>
                    <Badge tone="neutral">{r.type}</Badge>
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-0.5 truncate">{r.description}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 num">{r.rows.toLocaleString()} rows</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <ActionBtn icon={Eye} label="View" onClick={() => fire(`Opening ${r.name}…`)} />
                  <ActionBtn icon={Download} label="Download" onClick={() => fire(`Downloading ${r.name}`)} />
                  <ActionBtn icon={FileType} label="PDF" onClick={() => fire(`Exporting ${r.name} as PDF`)} primary />
                  <ActionBtn icon={FileSpreadsheet} label="Excel" onClick={() => fire(`Exporting ${r.name} as Excel`)} primary />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-md border border-border bg-surface shadow-elevated px-4 py-3 text-[12.5px] font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, primary }: { icon: typeof Eye; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md text-[11.5px] font-medium ${
        primary
          ? "border border-primary/30 bg-primary-muted text-primary hover:bg-primary/10"
          : "border border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="size-3.5" /> {label}
    </button>
  );
}
