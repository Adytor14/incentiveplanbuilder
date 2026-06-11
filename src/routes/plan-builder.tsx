import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui-kit";
import { Plus, Trash2, AlertTriangle, X, Info, Check, Loader2 } from "lucide-react";

type AutosaveState = "idle" | "saving" | "saved";

function AutosaveBadge({ state, savedAt }: { state: AutosaveState; savedAt: Date | null }) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 15_000);
    return () => clearInterval(t);
  }, []);
  const rel = (d: Date) => {
    const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
  };
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-info/30 bg-info/10 text-info text-[11.5px] font-medium">
        <Loader2 className="size-3 animate-spin" /> Saving…
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-success/30 bg-success/10 text-success text-[11.5px] font-medium"
      title={savedAt ? `Last autosaved ${savedAt.toLocaleString()}` : undefined}
    >
      <Check className="size-3" />
      {savedAt ? `Saved · ${rel(savedAt)}` : "All changes saved"}
    </span>
  );
}

export const Route = createFileRoute("/plan-builder")({
  head: () => ({
    meta: [
      { title: "Plan Builder · IC Design" },
      { name: "description", content: "Configure IC components per role and product with numeric weight allocation." },
    ],
  }),
  component: PlanBuilder,
});

type Role = "rep" | "rbm" | "asm";
type Product = { id: string; name: string; components: Component[] };
type Component = { id: string; name: string; category: string; weight: number };

const ROLE_LABEL: Record<Role, { name: string; sub: string }> = {
  rep: { name: "Sales Representative", sub: "Field-facing · 1,247 reps" },
  rbm: { name: "Regional Business Manager", sub: "First-line leader · 84 RBMs" },
  asm: { name: "Area Sales Manager", sub: "Senior leader · 12 ASMs" },
};

const COMPONENT_CATEGORIES = [
  "Individual Goal Attainment",
  "National Goal Attainment",
  "MBO",
  "Custom",
] as const;

const makeProduct = (id: string, name: string): Product => ({
  id,
  name,
  components: [
    { id: `${id}-c1`, name: "Individual Goal Attainment", category: "Individual Goal Attainment", weight: 40 },
    { id: `${id}-c2`, name: "National Goal Attainment", category: "National Goal Attainment", weight: 30 },
    { id: `${id}-c3`, name: "MBO 1 — Quality Calls", category: "MBO", weight: 20 },
    { id: `${id}-c4`, name: "MBO 2 — Speaker Programs", category: "MBO", weight: 10 },
  ],
});

const INITIAL: Record<Role, Product[]> = {
  rep: [makeProduct("rep-a", "Product A — Onclera"), makeProduct("rep-b", "Product B — Velorin"), makeProduct("rep-c", "Product C — Aurelix")],
  rbm: [makeProduct("rbm-a", "Product A — Onclera"), makeProduct("rbm-b", "Product B — Velorin")],
  asm: [makeProduct("asm-a", "Product A — Onclera"), makeProduct("asm-b", "Product B — Velorin")],
};

function PlanBuilder() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("rep");
  const [data, setData] = useState(INITIAL);
  const [activeProductId, setActiveProductId] = useState<Record<Role, string>>({
    rep: INITIAL.rep[0].id,
    rbm: INITIAL.rbm[0].id,
    asm: INITIAL.asm[0].id,
  });

  const [showInvalid, setShowInvalid] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const firstRender = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setAutosaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (doneTimer.current) clearTimeout(doneTimer.current);
    saveTimer.current = setTimeout(() => {
      setLastSavedAt(new Date());
      setAutosaveState("saved");
    }, 700);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (doneTimer.current) clearTimeout(doneTimer.current);
    };
  }, [data]);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Custom");
  const [newWeight, setNewWeight] = useState<number | "">(0);
  const [newProductName, setNewProductName] = useState("");
  const [addErrors, setAddErrors] = useState<{ name?: string; category?: string; weight?: string }>({});
  const [productError, setProductError] = useState<string | null>(null);

  const products = data[role];
  const activeProduct = products.find((p) => p.id === activeProductId[role]) ?? products[0];
  const components = activeProduct?.components ?? [];
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const balanced = totalWeight === 100;
  const remainingWeight = Math.max(0, 100 - totalWeight);

  const updateComponent = (id: string, patch: Partial<Component>) =>
    setData((prev) => ({
      ...prev,
      [role]: prev[role].map((p) =>
        p.id !== activeProduct.id ? p : { ...p, components: p.components.map((c) => (c.id === id ? { ...c, ...patch } : c)) },
      ),
    }));

  const removeComponent = (id: string) =>
    setData((prev) => ({
      ...prev,
      [role]: prev[role].map((p) =>
        p.id !== activeProduct.id ? p : { ...p, components: p.components.filter((c) => c.id !== id) },
      ),
    }));

  const openAdd = () => {
    setNewName("");
    setNewCategory("Custom");
    setNewWeight(remainingWeight);
    setAddErrors({});
    setShowAdd(true);
  };

  const validateAdd = () => {
    const errs: typeof addErrors = {};
    const name = newName.trim();
    if (!name) errs.name = "Name is required.";
    else if (name.length > 60) errs.name = "Keep name under 60 characters.";
    else if (components.some((c) => c.name.toLowerCase() === name.toLowerCase()))
      errs.name = "A component with this name already exists.";
    if (!newCategory.trim()) errs.category = "Category is required.";
    const w = typeof newWeight === "number" ? newWeight : Number(newWeight);
    if (newWeight === "" || Number.isNaN(w)) errs.weight = "Enter a number between 0 and 100.";
    else if (w < 0 || w > 100) errs.weight = "Weight must be between 0 and 100.";
    else if (!Number.isInteger(w)) errs.weight = "Weight must be a whole number.";
    return errs;
  };

  const submitAdd = () => {
    const errs = validateAdd();
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const w = typeof newWeight === "number" ? newWeight : Number(newWeight);
    const newComp: Component = {
      id: `c${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      weight: w,
    };
    setData((prev) => ({
      ...prev,
      [role]: prev[role].map((p) =>
        p.id !== activeProduct.id ? p : { ...p, components: [...p.components, newComp] },
      ),
    }));
    setShowAdd(false);
  };

  const submitAddProduct = () => {
    const name = newProductName.trim();
    if (!name) { setProductError("Product name is required."); return; }
    if (products.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setProductError("A product with this name already exists."); return;
    }
    const id = `${role}-p${Date.now()}`;
    setData((prev) => ({
      ...prev,
      [role]: [...prev[role], { id, name, components: [] }],
    }));
    setActiveProductId((p) => ({ ...p, [role]: id }));
    setNewProductName("");
    setProductError(null);
    setShowAddProduct(false);
  };

  const handleContinue = () => {
    const anyInvalid = products.some(
      (p) => p.components.length > 0 && p.components.reduce((s, c) => s + c.weight, 0) !== 100,
    );
    if (anyInvalid) {
      setShowInvalid(true);
      return;
    }
    navigate({ to: "/goal-setting" });
  };

  return (
    <>
      <PageHeader
        step={2}
        title="Plan Builder"
        prev={{ to: "/data-inputs", label: "Data Inputs" }}
        actions={
          <div className="flex items-center gap-3">
            <AutosaveBadge state={autosaveState} savedAt={lastSavedAt} />
          <button
            type="button"
            onClick={handleContinue}
            className={`h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold shadow-card ${
              balanced
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Continue to Goal Setting
          </button>
        }
      />
      <div className="px-8 py-7 max-w-[1400px] space-y-5">
        {/* Role tabs */}
        <Card className="p-2">
          <div className="flex gap-1">
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => {
              const active = r === role;
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 text-left rounded-md px-4 py-3 transition-all ${
                    active ? "bg-primary text-primary-foreground shadow-card" : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="text-[13.5px] font-semibold">{ROLE_LABEL[r].name}</div>
                  <div className={`text-[11.5px] mt-0.5 ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {ROLE_LABEL[r].sub}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Product tabs */}
        <Card className="p-0">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
              Products · {ROLE_LABEL[role].name}
            </div>
            <button
              type="button"
              onClick={() => { setShowAddProduct(true); setNewProductName(""); setProductError(null); }}
              className="h-7 px-2.5 inline-flex items-center gap-1 rounded-md border border-border bg-background text-[11.5px] font-medium hover:bg-muted"
            >
              <Plus className="size-3" /> Add Product
            </button>
          </div>
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {products.map((p) => {
              const active = p.id === activeProduct?.id;
              const t = p.components.reduce((s, c) => s + c.weight, 0);
              const ok = p.components.length === 0 || t === 100;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProductId((s) => ({ ...s, [role]: p.id }))}
                  className={`px-3.5 h-9 rounded-md text-[13px] font-medium inline-flex items-center gap-2 border transition-all ${
                    active
                      ? "border-primary bg-primary-muted text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {p.name}
                  <span className={`size-1.5 rounded-full ${ok ? "bg-success" : "bg-warning"}`} />
                </button>
              );
            })}
          </div>
        </Card>

        {/* Components for active product */}
        {activeProduct && (
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
              <div>
                <div className="text-[14.5px] font-semibold tracking-tight">
                  IC Components · {activeProduct.name}
                </div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  Numeric weight per component. Total must equal 100%.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-[12.5px] px-2.5 py-1 rounded-md border ${
                  balanced
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-warning/30 bg-warning/10 text-warning"
                }`}>
                  Total: <span className="font-semibold num">{totalWeight}%</span>
                </div>
                <button
                  type="button"
                  onClick={openAdd}
                  className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium hover:bg-primary/90"
                >
                  <Plus className="size-3.5" /> Add Component
                </button>
              </div>
            </div>

            {components.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-muted-foreground">
                No components yet. Use "Add Component" to start building this product's plan.
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground bg-muted/40">
                    <th className="text-left font-medium px-5 py-2.5">Component</th>
                    <th className="text-left font-medium px-5 py-2.5">Category</th>
                    <th className="text-right font-medium px-5 py-2.5 w-[140px]">Weight</th>
                    <th className="px-5 py-2.5 w-[60px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {components.map((c, i) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3 font-medium">
                        <span
                          className="inline-block size-2 rounded-sm mr-2 align-middle"
                          style={{ background: `var(--chart-${(i % 5) + 1})` }}
                        />
                        <input
                          value={c.name}
                          onChange={(e) => updateComponent(c.id, { name: e.target.value })}
                          className="bg-transparent border border-transparent hover:border-border focus:border-primary focus:bg-background rounded px-1.5 py-1 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-ring/30 w-[260px]"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={c.category}
                          onChange={(e) => updateComponent(c.id, { category: e.target.value })}
                          className="h-8 px-2 rounded-md border border-border bg-background text-[12.5px] focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                        >
                          {COMPONENT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          {!COMPONENT_CATEGORIES.includes(c.category as typeof COMPONENT_CATEGORIES[number]) && (
                            <option value={c.category}>{c.category}</option>
                          )}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={c.weight}
                            onChange={(e) =>
                              updateComponent(c.id, { weight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })
                            }
                            className="w-20 h-8 px-2 rounded-md border border-border bg-background text-[13px] num font-semibold text-right focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                          />
                          <span className="ml-1 text-[12px] text-muted-foreground">%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeComponent(c.id)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Remove"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!balanced && components.length > 0 && (
              <div className="px-5 py-3 border-t border-border bg-warning/10 text-warning text-[12.5px] flex items-center gap-2">
                <AlertTriangle className="size-3.5" />
                Component weights must total 100%. Currently {totalWeight}%.
              </div>
            )}
          </Card>
        )}
      </div>

      {showInvalid && (
        <Modal onClose={() => setShowInvalid(false)} title="Component weights must total 100%" tone="warning">
          <p className="text-[12.5px] text-muted-foreground">
            One or more products in this role have components that don't sum to 100%. Fix them before continuing.
          </p>
        </Modal>
      )}

      {showAddProduct && (
        <Modal onClose={() => setShowAddProduct(false)} title="Add Product" tone="primary">
          <label className="block">
            <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">Product Name</div>
            <input
              type="text"
              value={newProductName}
              onChange={(e) => { setNewProductName(e.target.value); setProductError(null); }}
              placeholder="e.g. Product D — Nexalin"
              className={`w-full h-9 px-2.5 rounded-md border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 ${
                productError ? "border-destructive" : "border-border focus:border-primary"
              }`}
            />
            {productError && <div className="mt-1 text-[11.5px] text-destructive">{productError}</div>}
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowAddProduct(false)} className="h-9 px-3.5 rounded-md border border-border bg-background text-[13px] font-medium hover:bg-muted">Cancel</button>
            <button onClick={submitAddProduct} className="h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90">Add Product</button>
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add Component" tone="primary" subtitle={`For ${activeProduct?.name}`}>
          <div className="space-y-3">
            <label className="block">
              <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">Name</div>
              <input
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); if (addErrors.name) setAddErrors((p) => ({ ...p, name: undefined })); }}
                maxLength={80}
                placeholder="e.g. MBO 3 — Coverage"
                className={`w-full h-9 px-2.5 rounded-md border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 ${addErrors.name ? "border-destructive" : "border-border focus:border-primary"}`}
              />
              {addErrors.name && <div className="mt-1 text-[11.5px] text-destructive">{addErrors.name}</div>}
            </label>
            <label className="block">
              <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">Category</div>
              <select
                value={newCategory}
                onChange={(e) => { setNewCategory(e.target.value); if (addErrors.category) setAddErrors((p) => ({ ...p, category: undefined })); }}
                className={`w-full h-9 px-2.5 rounded-md border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 ${addErrors.category ? "border-destructive" : "border-border focus:border-primary"}`}
              >
                {COMPONENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {addErrors.category && <div className="mt-1 text-[11.5px] text-destructive">{addErrors.category}</div>}
            </label>
            <label className="block">
              <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">Initial Weight</div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={newWeight}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewWeight(v === "" ? "" : Number(v));
                    if (addErrors.weight) setAddErrors((p) => ({ ...p, weight: undefined }));
                  }}
                  className={`w-full h-9 pl-2.5 pr-7 rounded-md border bg-background text-[13px] num font-medium focus:outline-none focus:ring-2 focus:ring-ring/30 ${addErrors.weight ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">%</span>
              </div>
              {addErrors.weight ? (
                <div className="mt-1 text-[11.5px] text-destructive">{addErrors.weight}</div>
              ) : (
                <div className="mt-1 text-[11px] text-muted-foreground">{remainingWeight}% available before exceeding 100%.</div>
              )}
            </label>
            <div className="text-[11.5px] text-muted-foreground flex items-start gap-1.5">
              <Info className="size-3 mt-0.5 shrink-0" />
              Remember to rebalance so all components sum to 100%.
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="h-9 px-3.5 rounded-md border border-border bg-background text-[13px] font-medium hover:bg-muted">Cancel</button>
            <button onClick={submitAdd} className="h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90">Add Component</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({
  onClose,
  title,
  subtitle,
  tone = "primary",
  children,
}: {
  onClose: () => void;
  title: string;
  subtitle?: string;
  tone?: "primary" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="max-w-md w-full p-0">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
          <div className={`size-9 rounded-lg grid place-items-center ${tone === "warning" ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"}`}>
            {tone === "warning" ? <AlertTriangle className="size-4" /> : <Plus className="size-4" />}
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-semibold">{title}</div>
            {subtitle && <div className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="size-7 grid place-items-center rounded-md hover:bg-muted">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </Card>
    </div>
  );
}
