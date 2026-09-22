import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Info, ShieldAlert, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader, Badge } from "@/components/ui-kit";

type PlanVersion = {
  id: string;
  name: string;
  created_at: string;
  quarter: string | null;
  last_used_at: string | null;
  created_by: string | null;
  status: string;
  request_status: string;
  approval_status: string;
  comments: string | null;
};

type Filter = "Pending" | "Approved" | "Rejected" | "All";

const APPROVAL_TONE: Record<string, "warning" | "success" | "danger" | "neutral"> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
};

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Requests · Helix IC" },
      {
        name: "description",
        content: "Review, approve, or reject incentive plan version requests submitted to HQ.",
      },
      { property: "og:title", content: "Requests · Helix IC" },
      {
        property: "og:description",
        content: "Review, approve, or reject incentive plan version requests submitted to HQ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const [rows, setRows] = useState<PlanVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("Pending");
  const [detail, setDetail] = useState<PlanVersion | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("ic_plan_versions")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (!error && data) setRows(data as PlanVersion[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const requests = useMemo(
    () => rows.filter((r) => r.request_status !== "Not Requested"),
    [rows],
  );

  const visible = useMemo(
    () => (filter === "All" ? requests : requests.filter((r) => r.approval_status === filter)),
    [requests, filter],
  );

  const counts = useMemo(
    () => ({
      Pending: requests.filter((r) => r.approval_status === "Pending").length,
      Approved: requests.filter((r) => r.approval_status === "Approved").length,
      Rejected: requests.filter((r) => r.approval_status === "Rejected").length,
      All: requests.length,
    }),
    [requests],
  );

  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "—");

  const decide = async (row: PlanVersion, decision: "Approved" | "Rejected") => {
    setSaving(true);
    const comments = note.trim()
      ? note.trim()
      : decision === "Approved"
        ? "Approved by HQ."
        : "Rejected by HQ.";
    const patch = {
      approval_status: decision,
      status: decision === "Approved" ? "Approved" : "Draft",
      request_status: decision === "Rejected" ? "Change Requested" : row.request_status,
      comments,
    };
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
    await supabase.from("ic_plan_versions").update(patch).eq("id", row.id);
    setSaving(false);
    setDetail(null);
    setNote("");
  };

  return (
    <>
      <PageHeader eyebrow="HQ / Admin" title="Plan Approval Requests" />

      <div className="px-8 py-6 max-w-[1400px]">
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
          <ShieldAlert className="size-4 mt-0.5 text-warning shrink-0" />
          <p className="text-[12.5px] text-foreground">
            <span className="font-semibold">Note:</span> This screen is only meant to be visible to
            HQ / Admin users. It is temporarily visible to everyone for review purposes.
          </p>
        </div>

        <div className="mb-4 flex items-center gap-2">
          {(["Pending", "Approved", "Rejected", "All"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-7 px-3 rounded-full text-[12px] font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
              }`}
            >
              {f} · {counts[f]}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-[13px]">
              <thead className="bg-muted/40 text-[11.5px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Plan Version</th>
                  <th className="text-left font-semibold px-5 py-3">Quarter</th>
                  <th className="text-left font-semibold px-5 py-3">Requested by</th>
                  <th className="text-left font-semibold px-5 py-3">Request</th>
                  <th className="text-left font-semibold px-5 py-3">Approval</th>
                  <th className="text-left font-semibold px-5 py-3">Submitted</th>
                  <th className="text-right font-semibold px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-6 text-center text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && visible.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-6 text-center text-muted-foreground">
                      No {filter === "All" ? "" : filter.toLowerCase() + " "}requests.
                    </td>
                  </tr>
                )}
                {visible.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.quarter ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.created_by ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge tone={r.request_status === "Requested" ? "info" : "warning"}>
                        {r.request_status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={APPROVAL_TONE[r.approval_status] ?? "neutral"}>
                        {r.approval_status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{fmt(r.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => {
                          setDetail(r);
                          setNote("");
                        }}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-background text-[12px] font-medium hover:bg-muted"
                      >
                        <Info className="size-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm px-4">
          <Card className="w-full max-w-2xl max-h-[88vh] overflow-y-auto">
            <CardHeader
              title="Request Summary"
              description={detail.name}
              right={
                <button
                  onClick={() => setDetail(null)}
                  className="size-8 grid place-items-center rounded-md border border-border hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              }
            />
            <div className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <Field label="Plan Period" value={detail.quarter ?? "—"} />
                <Field label="Requested by" value={detail.created_by ?? "—"} />
                <Field label="Plan Status" value={detail.status} />
                <Field label="Request Status" value={detail.request_status} />
                <Field label="Approval Status" value={detail.approval_status} />
                <Field label="Submitted" value={fmt(detail.created_at)} />
                <Field label="Last autosaved" value={fmt(detail.last_used_at)} />
              </div>

              <div className="mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Requester comments
                </div>
                <p className="mt-1 text-[13px] text-foreground">
                  {detail.comments ?? "No comments"}
                </p>
              </div>

              <div className="mt-4">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Decision note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note for the plan owner (optional)"
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  disabled={saving}
                  onClick={() => decide(detail, "Rejected")}
                  className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-[13px] font-semibold hover:bg-destructive/15 disabled:opacity-60"
                >
                  <XCircle className="size-4" /> Reject
                </button>
                <button
                  disabled={saving}
                  onClick={() => decide(detail, "Approved")}
                  className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-60"
                >
                  <CheckCircle2 className="size-4" /> Approve
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="text-[13px] text-foreground mt-0.5">{value}</div>
    </div>
  );
}
