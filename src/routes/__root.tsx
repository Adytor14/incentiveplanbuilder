import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import {
  LayoutGrid,
  Layers,
  Target,
  Activity,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  Bell,
  Database,
} from "lucide-react";

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
      { title: "Helix IC — Incentive Compensation Design Platform" },
      {
        name: "description",
        content:
          "Design, simulate, and approve pharma incentive compensation plans with confidence.",
      },
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
  { to: "/", label: "Overview", icon: LayoutGrid, step: null },
  { to: "/data-inputs", label: "Data Inputs", icon: Database, step: null },
  { to: "/plan-builder", label: "Plan Builder", icon: Layers, step: 1 },
  { to: "/goal-setting", label: "Goal Setting", icon: Target, step: 2 },
  { to: "/payout-curve", label: "Payout Curve", icon: TrendingUp, step: 3 },
  { to: "/simulation", label: "Monte Carlo", icon: Activity, step: 4 },
  { to: "/fairness", label: "Fairness Testing", icon: ShieldCheck, step: 5 },
  { to: "/approval", label: "Final Approval", icon: CheckCircle2, step: 6 },
] as const;

function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-elevated">
            <Sparkles className="size-4.5 text-sidebar-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">Helix IC</div>
            <div className="text-[11px] text-sidebar-foreground/60 -mt-0.5">Plan Design Studio</div>
          </div>
        </Link>
      </div>

      <div className="px-3 pt-5 pb-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/50 px-2 mb-2">
          Plan Workflow · FY26
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

      <div className="m-3 p-3.5 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="size-1.5 rounded-full bg-success animate-pulse" />
          <div className="text-[11px] font-medium text-sidebar-foreground">Plan v2.4 · Draft</div>
        </div>
        <div className="text-[11px] text-sidebar-foreground/60 leading-relaxed">
          Last edited 12 min ago by S. Mehta
        </div>
      </div>

      <div className="border-t border-sidebar-border p-3 flex items-center gap-3">
        <div className="size-8 rounded-full bg-gradient-to-br from-sidebar-primary to-info flex items-center justify-center text-[12px] font-semibold text-sidebar-primary-foreground">
          SM
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-medium truncate">Shreya Mehta</div>
          <div className="text-[11px] text-sidebar-foreground/60 truncate">HQ · IC Admin</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { pathname } = useLocation();
  const current = NAV.find((n) => n.to === pathname);
  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-6 gap-4">
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <span>OncoPharma · US Specialty BU</span>
        <span className="text-border-strong">/</span>
        <span className="text-foreground font-medium">{current?.label ?? "Plan Studio"}</span>
      </div>
      <div className="flex-1" />
      <div className="hidden md:flex items-center gap-2 px-3 h-9 w-72 rounded-md border border-border bg-background text-[13px] text-muted-foreground">
        <Search className="size-3.5" />
        <span>Search reps, products, scenarios…</span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted">⌘K</span>
      </div>
      <button className="size-9 grid place-items-center rounded-md border border-border bg-background hover:bg-muted">
        <Bell className="size-4 text-muted-foreground" />
      </button>
      <div className="h-6 w-px bg-border" />
      <button className="h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 shadow-card">
        Save Draft
      </button>
    </header>
  );
}

function RootComponent() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
