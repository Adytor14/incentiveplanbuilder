import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import {
  Home,
  Layers,
  Target,
  ShieldCheck,
  TrendingUp,
  FileText,
  Sparkles,
  Database,
  Calendar,
  
  Activity,
} from "lucide-react";
import { PlanPeriodProvider, usePlanPeriod, PLAN_PERIODS } from "@/lib/plan-period";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Helix IC — Incentive Compensation Design Workbench" },
      {
        name: "description",
        content:
          "Design incentive plans that drive motivation, fairness, and business results for pharma commercial teams.",
      },
      { property: "og:title", content: "Helix IC — Incentive Compensation Design Workbench" },
      { name: "twitter:title", content: "Helix IC — Incentive Compensation Design Workbench" },
      { property: "og:description", content: "Create, evaluate, and optimize incentive compensation plans using historical performance, territory potential, goals, payouts, and fairness analytics." },
      { name: "twitter:description", content: "Create, evaluate, and optimize incentive compensation plans using historical performance, territory potential, goals, payouts, and fairness analytics." },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/", label: "Home", icon: Home, step: null },
  { to: "/data-inputs", label: "Data Inputs", icon: Database, step: 1 },
  { to: "/plan-builder", label: "Plan Builder", icon: Layers, step: 2 },
  { to: "/goal-setting", label: "Goal Setting", icon: Target, step: 3 },
  { to: "/fairness", label: "Fairness Testing", icon: ShieldCheck, step: 4 },
  { to: "/payout-curve", label: "Payout Curve", icon: TrendingUp, step: 5 },
  { to: "/simulation", label: "Monte Carlo", icon: Activity, step: 6 },
  { to: "/reports", label: "Reports & Outputs", icon: FileText, step: 7 },
] as const;

function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-elevated">
            <Sparkles className="size-4 text-sidebar-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">Helix IC</div>
            <div className="text-[11px] text-sidebar-foreground/60 -mt-0.5">Plan Design Workbench</div>
          </div>
        </Link>
      </div>

      <div className="px-3 pt-5 pb-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/50 px-2 mb-2">
          Plan Design Workflow
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "group flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] transition-all",
                active
                  ? "bg-sidebar-primary/15 text-sidebar-foreground font-medium"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              ].join(" ")}
            >
              {item.step !== null ? (
                <span
                  className={[
                    "size-5 shrink-0 rounded-full text-[10px] font-semibold flex items-center justify-center",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "bg-sidebar-accent text-sidebar-foreground/70",
                  ].join(" ")}
                >
                  {item.step}
                </span>
              ) : (
                <Icon className="size-4 shrink-0" strokeWidth={2} />
              )}
              <span className="flex-1 truncate">{item.label}</span>
              {active && <span className="size-1.5 rounded-full bg-sidebar-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 flex items-center gap-3">
        <div className="size-8 rounded-full bg-gradient-to-br from-sidebar-primary to-info flex items-center justify-center text-[12px] font-semibold text-sidebar-primary-foreground">
          SM
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-medium truncate">Shreya Mehta</div>
          <div className="text-[11px] text-sidebar-foreground/60 truncate">HQ · Commercial Ops</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { pathname } = useLocation();
  const current = NAV.find((n) => n.to === pathname);
  const { period, setPeriod } = usePlanPeriod();

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-6 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-[13.5px] font-semibold text-foreground truncate">
          IC Plan Design for {period}
        </div>
        {current && current.step !== null && (
          <span className="hidden md:inline-flex items-center gap-1.5 px-2 h-5 rounded-full bg-primary-muted text-primary text-[10.5px] font-semibold border border-primary/20">
            Step {current.step} · {current.label}
          </span>
        )}
      </div>
      <div className="flex-1" />
      <label className="hidden md:flex items-center gap-2 h-9 px-2.5 rounded-md border border-border bg-background text-[12.5px]">
        <Calendar className="size-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Plan Period</span>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className="bg-transparent text-foreground font-medium focus:outline-none"
        >
          {PLAN_PERIODS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>
      <div className="h-6 w-px bg-border" />

      <div className="size-8 rounded-full bg-gradient-to-br from-primary to-info text-primary-foreground text-[12px] font-semibold grid place-items-center">
        SM
      </div>
    </header>
  );
}

function RootComponent() {
  return (
    <PlanPeriodProvider>
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </PlanPeriodProvider>
  );
}
