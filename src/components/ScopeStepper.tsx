import { ChevronRight, Package, Users } from "lucide-react";
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
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-7 px-3 rounded-full text-[12px] font-medium border transition-colors whitespace-nowrap",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-card"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function StepGroup({
  index,
  icon: Icon,
  label,
  children,
}: {
  index: number;
  icon: typeof Users;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="size-5 grid place-items-center rounded-full bg-primary-muted text-primary text-[10.5px] font-semibold num">
          {index}
        </span>
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">{children}</div>
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
  return (
    <div
      className={cn(
        "flex items-center gap-4 flex-wrap rounded-lg border border-border bg-surface px-4 py-2.5",
        className,
      )}
    >
      <StepGroup index={1} icon={Users} label="Role">
        {ROLES.map((r) => (
          <Chip
            key={r.id}
            label={r.short}
            active={r.id === roleId}
            onClick={() => onRoleChange(r.id)}
          />
        ))}
      </StepGroup>

      <ChevronRight className="size-4 text-muted-foreground/60 shrink-0" />

      <StepGroup index={2} icon={Package} label="Product">
        {PRODUCTS.map((p) => (
          <Chip
            key={p.id}
            label={p.name}
            active={p.id === productId}
            onClick={() => onProductChange(p.id)}
          />
        ))}
      </StepGroup>

      <span className="ml-auto text-[11.5px] text-muted-foreground shrink-0">
        Configure each role × product combination
      </span>
    </div>
  );
}
