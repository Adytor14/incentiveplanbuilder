import { CornerDownRight, Package, Users } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface Props {
  roleId: string;
  productId: string;
  onRoleChange: (id: string) => void;
  onProductChange: (id: string) => void;
  className?: string;
}

function Chip({
  label,
  active,
  onClick,
  size = "md",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  size?: "md" | "sm";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full font-medium border transition-colors whitespace-nowrap",
        size === "md" ? "h-8 px-3.5 text-[12.5px]" : "h-7 px-3 text-[12px]",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-card"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function StepLabel({
  index,
  icon: Icon,
  label,
}: {
  index: number;
  icon: typeof Users;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0 w-[132px]">
      <span className="size-5 grid place-items-center rounded-full bg-primary-muted text-primary text-[10.5px] font-semibold num">
        {index}
      </span>
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function ScopeStepper({
  roleId,
  productId,
  onRoleChange,
  onProductChange,
  className,
}: Props) {
  const role = ROLES.find((r) => r.id === roleId);
  const product = PRODUCTS.find((p) => p.id === productId);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface px-4 py-3 space-y-2.5",
        className,
      )}
    >
      {/* Step 1 — Role */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <StepLabel index={1} icon={Users} label="Role" />
        <div className="flex items-center gap-1.5 flex-wrap">
          {ROLES.map((r) => (
            <Chip
              key={r.id}
              label={r.short}
              active={r.id === roleId}
              onClick={() => onRoleChange(r.id)}
            />
          ))}
        </div>
      </div>

      {/* Step 2 — Product, nested under the selected role */}
      <div className="flex items-start gap-2.5 flex-wrap pl-[18px] border-l-2 border-dashed border-border ml-[9px]">
        <div className="flex items-center gap-1.5 pt-0.5">
          <CornerDownRight className="size-3.5 text-muted-foreground/70 -ml-1" />
          <StepLabel index={2} icon={Package} label="Product" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRODUCTS.map((p) => (
            <Chip
              key={p.id}
              label={p.name}
              size="sm"
              active={p.id === productId}
              onClick={() => onProductChange(p.id)}
            />
          ))}
        </div>
      </div>

      <div className="pl-[18px] ml-[9px] text-[11.5px] text-muted-foreground">
        Editing <span className="font-semibold text-foreground">{role?.name}</span> ·{" "}
        <span className="font-semibold text-foreground">{product?.name}</span> — enter Goal
        Setting, Fairness Testing and Payout Curve values for each role × product combination.
      </div>
    </div>
  );
}
