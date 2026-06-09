import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Layers, Target, ShieldCheck, TrendingUp, FileText, Database } from "lucide-react";
import { usePlanPeriod } from "@/lib/plan-period";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · Helix IC" },
      {
        name: "description",
        content:
          "Design incentive plans that drive motivation, fairness, and business results.",
      },
    ],
  }),
  component: Home,
});

const STEPS = [
  { icon: Database, label: "Data Inputs", to: "/data-inputs" },
  { icon: Layers, label: "Plan Builder", to: "/plan-builder" },
  { icon: Target, label: "Goal Setting", to: "/goal-setting" },
  { icon: ShieldCheck, label: "Fairness Testing", to: "/fairness" },
  { icon: TrendingUp, label: "Payout Curve", to: "/payout-curve" },
  { icon: FileText, label: "Reports & Outputs", to: "/reports" },
] as const;

function Home() {
  const { period } = usePlanPeriod();
  return (
    <div className="px-8 py-12 max-w-[1100px] mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.13_262)] text-primary-foreground shadow-premium">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-info/20 blur-3xl" />
        <div className="relative px-10 py-14">
          <div className="inline-flex items-center gap-2 px-2.5 h-6 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium backdrop-blur">
            <Sparkles className="size-3" /> Planning Cycle · {period}
          </div>
          <h1 className="mt-5 text-[40px] font-semibold tracking-tight leading-[1.1] text-balance max-w-3xl">
            Design incentive plans that drive motivation, fairness, and business results.
          </h1>
          <p className="mt-4 text-[15px] text-primary-foreground/80 max-w-2xl leading-relaxed">
            Create, evaluate, and optimize incentive compensation plans using historical performance,
            territory potential, goals, payouts, and fairness analytics.
          </p>
          <div className="mt-8">
            <Link
              to="/data-inputs"
              className="h-11 px-5 inline-flex items-center gap-2 rounded-md bg-white text-primary text-[14px] font-semibold hover:bg-white/90 shadow-elevated"
            >
              Begin Plan Design <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-3">
          Plan Design Workflow
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.to}
                to={s.to}
                className="group rounded-xl border border-border bg-surface p-4 hover:border-primary/40 hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="size-7 rounded-full bg-primary-muted text-primary text-[11px] font-semibold grid place-items-center">
                    {i + 1}
                  </span>
                  <Icon className="size-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <div className="mt-3 text-[13px] font-semibold text-foreground">{s.label}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
