import * as React from "react";

export function Card({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  right,
  className = "",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 px-5 pt-5 pb-3 ${className}`}>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold tracking-tight text-foreground">{title}</div>
        {description && (
          <div className="text-[12px] text-muted-foreground mt-0.5">{description}</div>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  delta,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  hint?: string;
}) {
  const toneCls = {
    neutral: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
    info: "text-info",
  }[tone];
  return (
    <div className="px-5 py-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <div className={`text-[24px] font-semibold tracking-tight num ${toneCls}`}>{value}</div>
        {delta && <div className="text-[12px] font-medium text-muted-foreground num">{delta}</div>}
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "primary";
  className?: string;
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground border-border",
    primary: "bg-primary-muted text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/25",
    warning: "bg-warning/15 text-warning-foreground border-warning/30",
    danger: "bg-destructive/10 text-destructive border-destructive/25",
    info: "bg-info/10 text-info border-info/25",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10.5px] font-medium border ${tones} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone }: { tone: "success" | "warning" | "danger" | "info" }) {
  const c = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
    info: "bg-info",
  }[tone];
  return <span className={`size-1.5 rounded-full ${c}`} />;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  trackClass = "bg-primary",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  trackClass?: string;
}) {
  return (
    <div className="relative h-7 flex items-center">
      <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted" />
      <div
        className={`absolute h-1.5 rounded-full ${trackClass}`}
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="relative w-full appearance-none bg-transparent cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:size-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-surface
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-primary
          [&::-webkit-slider-thumb]:shadow-elevated
          [&::-webkit-slider-thumb]:cursor-grab"
      />
    </div>
  );
}

export function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex p-0.5 rounded-md border border-border bg-muted/50">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 h-7 rounded text-[12px] font-medium transition-all ${
            value === o.value
              ? "bg-surface text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
