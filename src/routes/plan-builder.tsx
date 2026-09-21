import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui-kit";
import { Plus, Trash2, AlertTriangle, X, Info } from "lucide-react";
import { PRODUCTS } from "@/lib/products";


export const Route = createFileRoute("/plan-builder")({
  head: () => ({
    meta: [
      { title: "Plan Builder · IC Design" },
      { name: "description", content: "Configure IC components per role and product with numeric weight allocation." },
      { property: "og:title", content: "Plan Builder · IC Design" },
      { property: "og:description", content: "Configure product weightage and IC components per role." },
    ],
  }),
  component: PlanBuilder,
});

type Role = "rep" | "rbm" | "asm";
type ComponentType = "Goal Attainment" | "MBO";
type Product = { id: string; name: string; weight: number; components: Component[] };
type Component = { id: string; type: ComponentType; subtype: string; weight: number };

const ROLE_LABEL: Record<Role, { name: string; sub: string }> = {
  rep: { name: "Sales Representative", sub: "Field-facing · 15 reps" },
  rbm: { name: "Regional Business Manager", sub: "First-line leader · 84 RBMs" },
  asm: { name: "Area Sales Manager", sub: "Senior leader · 12 ASMs" },
};

const COMPONENT_TYPES: ComponentType[] = ["Goal Attainment", "MBO"];

const SUBTYPES: Record<ComponentType, string[]> = {
  "Goal Attainment": ["Individual Goal Attainment", "National Goal Attainment"],
  MBO: ["MBO 1", "MBO 2", "MBO 3", "MBO 4"],
};

const makeProduct = (id: string, name: string, weight: number): Product => ({
  id,
  name,
  weight,
  components: [
    { id: `${id}-c1`, type: "Goal Attainment", subtype: "Individual Goal Attainment", weight: 40 },
    { id: `${id}-c2`, type: "Goal Attainment", subtype: "National Goal Attainment", weight: 30 },
    { id: `${id}-c3`, type: "MBO", subtype: "MBO 1", weight: 20 },
    { id: `${id}-c4`, type: "MBO", subtype: "MBO 2", weight: 10 },
  ],
});

// Same set of products for every role (TMs, RMs, AMs) — product weightage differs by role.
const PRODUCT_WEIGHTS: Record<Role, number[]> = {
  rep: [50, 30, 20],
  rbm: [40, 35, 25],
  asm: [34, 33, 33],
};

const INITIAL: Record<Role, Product[]> = {
  rep: PRODUCTS.map((p, i) => makeProduct(`rep-${p.id}`, p.name, PRODUCT_WEIGHTS.rep[i] ?? 0)),
  rbm: PRODUCTS.map((p, i) => makeProduct(`rbm-${p.id}`, p.name, PRODUCT_WEIGHTS.rbm[i] ?? 0)),
  asm: PRODUCTS.map((p, i) => makeProduct(`asm-${p.id}`, p.name, PRODUCT_WEIGHTS.asm[i] ?? 0)),
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
  const [newType, setNewType] = useState<ComponentType>("Goal Attainment");
  const [newSubtype, setNewSubtype] = useState<string>(SUBTYPES["Goal Attainment"][0]);
  const [newWeight, setNewWeight] = useState<number | "">(0);
  const [addErrors, setAddErrors] = useState<{ subtype?: string; weight?: string }>({});

  const products = data[role];
  const activeProduct = products.find((p) => p.id === activeProductId[role]) ?? products[0];
  const components = activeProduct?.components ?? [];
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const balanced = totalWeight === 100;
  const remainingWeight = Math.max(0, 100 - totalWeight);
  const productWeightTotal = products.reduce((s, p) => s + p.weight, 0);
  const productWeightBalanced = productWeightTotal === 100;

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

  const updateProductWeight = (id: string, weight: number) =>
    setData((prev) => ({
      ...prev,
      [role]: prev[role].map((p) => (p.id === id ? { ...p, weight } : p)),
    }));

  const openAdd = () => {
    setNewType("Goal Attainment");
    setNewSubtype(SUBTYPES["Goal Attainment"][0]);
    setNewWeight(remainingWeight);
    setAddErrors({});
    setShowAdd(true);
  };

  const validateAdd = () => {
    const errs: typeof addErrors = {};
    if (!newSubtype) errs.subtype = "Select a component.";
    else if (components.some((c) => c.subtype === newSubtype))
      errs.subtype = "This component is already added for the product.";
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
      type: newType,
      subtype: newSubtype,
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

  const handleContinue = () => {
    const anyInvalid = products.some(
      (p) => p.components.length > 0 && p.components.reduce((s, c) => s + c.weight, 0) !== 100,
    );
    if (anyInvalid || !productWeightBalanced) {
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
          <button
            type="button"
            onClick={handleContinue}
            className={`h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold shadow-card ${
              balanced && productWeightBalanced
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Continue to Goal Setting
          </button>
          </div>
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

        {/* Product weightage + selection */}
        <Card className="p-0">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3 border-b border-border">
            <div>
              <div className="text-[14px] font-semibold tracking-tight">
                Product Weightage · {ROLE_LABEL[role].name}
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Weight each product for this role. Total must equal 100%. Select a product to edit its IC components.
              </div>
            </div>
            <div className={`text-[12.5px] px-2.5 py-1 rounded-md border ${
              productWeightBalanced
                ? "border-success/30 bg-success/10 text-success"
                : "border-warning/30 bg-warning/10 text-warning"
            }`}>
              Total: <span className="font-semibold num">{productWeightTotal}%</span>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {products.map((p) => {
              const active = p.id === activeProduct?.id;
              const t = p.components.reduce((s, c) => s + c.weight, 0);
              const ok = p.components.length === 0 || t === 100;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setActiveProductId((s) => ({ ...s, [role]: p.id }))}
                  aria-pressed={active}
                  className={`relative overflow-hidden rounded-lg border p-3 text-left transition-all ${
                    active
                      ? "border-primary bg-primary-muted shadow-elevated ring-2 ring-primary/25"
                      : "border-border bg-background hover:bg-muted/40 hover:border-border-strong"
                  }`}
                >
                  {active && <span className="absolute inset-y-0 left-0 w-1 bg-primary" />}
                  <div className="flex items-center justify-between gap-2">
                    <div className={`text-[13px] font-semibold truncate ${active ? "text-primary" : "text-foreground"}`}>{p.name}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      {active && (
                        <span className="h-5 px-2 inline-flex items-center rounded-full bg-primary text-primary-foreground text-[10.5px] font-semibold">
                          Selected
                        </span>
                      )}
                      <span className={`size-1.5 rounded-full ${ok ? "bg-success" : "bg-warning"}`} />
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-medium">
                      Weight
                    </span>
                    <div className="inline-flex items-center ml-auto">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={p.weight}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          updateProductWeight(p.id, Math.max(0, Math.min(100, Number(e.target.value) || 0)))
                        }
                        className="w-20 h-8 px-2 rounded-md border border-border bg-required-bg text-[13px] num font-semibold text-right focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                      />
                      <span className="ml-1 text-[12px] text-muted-foreground">%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {!productWeightBalanced && (
            <div className="px-5 py-3 border-t border-border bg-warning/10 text-warning text-[12.5px] flex items-center gap-2">
              <AlertTriangle className="size-3.5" />
              Product weightage must total 100%. Currently {productWeightTotal}%.
            </div>
          )}
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
                  Select a component type, then the specific component. Total weight must equal 100%.
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
                    <th className="text-left font-medium px-5 py-2.5 w-[240px]">Component Type</th>
                    <th className="text-left font-medium px-5 py-2.5">Component</th>
                    <th className="text-right font-medium px-5 py-2.5 w-[140px]">Weight</th>
                    <th className="px-5 py-2.5 w-[60px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {components.map((c, i) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <span
                          className="inline-block size-2 rounded-sm mr-2 align-middle"
                          style={{ background: `var(--chart-${(i % 5) + 1})` }}
                        />
                        <select
                          value={c.type}
                          onChange={(e) => {
                            const type = e.target.value as ComponentType;
                            updateComponent(c.id, { type, subtype: SUBTYPES[type][0] });
                          }}
                          className="h-8 px-2 rounded-md border border-border bg-background text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                        >
                          {COMPONENT_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={c.subtype}
                          onChange={(e) => updateComponent(c.id, { subtype: e.target.value })}
                          className="h-8 px-2 rounded-md border border-border bg-background text-[12.5px] focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                        >
                          {SUBTYPES[c.type].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
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
                            className="w-20 h-8 px-2 rounded-md border border-border bg-required-bg text-[13px] num font-semibold text-right focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
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
        <Modal onClose={() => setShowInvalid(false)} title="Weights must total 100%" tone="warning">
          <p className="text-[12.5px] text-muted-foreground">
            Product weightage and every product's IC component weights must each sum to 100% before continuing.
          </p>
        </Modal>
      )}

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add Component" tone="primary" subtitle={`For ${activeProduct?.name}`}>
          <div className="space-y-3">
            <label className="block">
              <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">Component Type</div>
              <select
                value={newType}
                onChange={(e) => {
                  const t = e.target.value as ComponentType;
                  setNewType(t);
                  setNewSubtype(SUBTYPES[t][0]);
                  setAddErrors((p) => ({ ...p, subtype: undefined }));
                }}
                className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
              >
                {COMPONENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="block">
              <div className="text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">Component</div>
              <select
                value={newSubtype}
                onChange={(e) => { setNewSubtype(e.target.value); setAddErrors((p) => ({ ...p, subtype: undefined })); }}
                className={`w-full h-9 px-2.5 rounded-md border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 ${addErrors.subtype ? "border-destructive" : "border-border focus:border-primary"}`}
              >
                {SUBTYPES[newType].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {addErrors.subtype && <div className="mt-1 text-[11.5px] text-destructive">{addErrors.subtype}</div>}
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
