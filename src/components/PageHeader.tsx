import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  step?: number;
  eyebrow?: string;
  title: string;
  description: string;
  prev?: { to: string; label: string };
  next?: { to: string; label: string };
  actions?: React.ReactNode;
}

export function PageHeader({ step, eyebrow, title, description, prev, next, actions }: Props) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="px-8 py-7 max-w-[1600px]">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2.5">
              {step !== undefined && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
                  <span className="size-5 rounded-full bg-primary text-primary-foreground grid place-items-center text-[10px]">
                    {step}
                  </span>
                  Step {step} of 7
                </span>
              )}
              {eyebrow && (
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  · {eyebrow}
                </span>
              )}
            </div>
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground text-balance">
              {title}
            </h1>
            <p className="mt-1.5 text-[14px] text-muted-foreground max-w-2xl text-balance">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {actions}
            {prev && (
              <Link
                to={prev.to}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[13px] font-medium text-foreground hover:bg-muted"
              >
                <ArrowLeft className="size-3.5" />
                {prev.label}
              </Link>
            )}
            {next && (
              <Link
                to={next.to}
                className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 shadow-card"
              >
                {next.label}
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
