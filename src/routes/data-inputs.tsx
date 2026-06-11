import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge } from "@/components/ui-kit";
import {
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Calendar,
  Lock,
} from "lucide-react";
import { usePlanPeriod, PLAN_PERIODS } from "@/lib/plan-period";
import {
  DATASETS as INITIAL_DATASETS,
  datasetsReady,
  type Dataset,
} from "@/lib/data-inputs";
import { supabase } from "@/integrations/supabase/client";

type PlanVersion = { id: string; name: string; created_at: string };

export const Route = createFileRoute("/data-inputs")({
...
        </Card>

        <Card className="p-0">
          <div className="px-6 pt-5 pb-4 border-b border-border flex items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                <Database className="size-3.5 text-primary" /> Required Datasets
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                {validated} of {datasets.length} validated · all required datasets must be present before the Plan Builder can run.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={ready ? "success" : "warning"}>
                {ready ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
                {ready ? "Ready to build plan" : "Resolve warnings"}
              </Badge>
            </div>
          </div>

          <div className="divide-y divide-border">
            {datasets.map((d) => (
              <div key={d.id} className="px-6 py-4 flex items-center gap-4">
                <div className="size-10 rounded-lg bg-muted/60 grid place-items-center shrink-0">
                  <FileSpreadsheet className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[13.5px] font-semibold text-foreground truncate">
                      {d.name}
                    </div>
                    <Badge tone="neutral">{d.source}</Badge>
                    {d.required && <Badge tone="primary">Required</Badge>}
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-0.5 truncate">
                    {d.description}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 num">
                    {d.rows !== null ? `${d.rows.toLocaleString()} rows` : "—"} · updated {d.updatedAt ?? "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.status === "warning" ? (
                    <button
                      type="button"
                      onClick={() => revalidate(d.id)}
                      className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[12px] font-medium hover:bg-muted"
                    >
                      <RefreshCw className="size-3.5" /> Re-validate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[12px] font-medium hover:bg-muted"
                    >
                      <Upload className="size-3.5" /> Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
            <Link
              to="/plan-builder"
              className={`h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold shadow-card ${
                ready
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground pointer-events-none"
              }`}
            >
              Continue to Plan Builder <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
}
