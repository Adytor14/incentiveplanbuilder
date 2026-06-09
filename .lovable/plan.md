# IC Design Platform — UX/UI Revision v2

A large restructure of the workflow, navigation, and several pages. Below is the build plan organized by deliverable.

## 1. Workflow & Navigation Restructure

New step order (replaces current 7-step flow):

```text
0. Home (was Overview — repurposed as landing CTA)
1. Data Inputs
2. Plan Builder
3. Goal Setting
4. Fairness Testing   ← moved BEFORE Payout
5. Payout Curve Design
6. Reports & Outputs
```

- Update `PageHeader` step indicator + prev/next wiring on every route.
- Remove "Approval", "Simulation Risk", "Governance" framing from copy/components.
- Delete or repurpose `src/routes/approval.tsx` and `src/routes/simulation.tsx` (fold useful bits into Fairness or Reports; otherwise remove from nav).

## 2. Global Header — Plan Period

- Add a global `PlanPeriodContext` (React context + `localStorage` persistence) with options: Q1 2026, Q2 2026, Q3 2026, Q4 2026, Q1 2027, Q2 2027.
- `PageHeader` shows: **"IC Plan Design for {period}"** + period dropdown, Save Draft, Export, User menu.
- Selected period drives default historical period in Goal Setting (e.g., Q2 2026 → defaults historical to Q1 2026).

## 3. Home Page (replaces Overview)

- `src/routes/index.tsx` → headline, supporting paragraph, single primary CTA **"Begin Plan Design"** → `/data-inputs`.
- Remove the multi-card overview grid.

## 4. Data Inputs

Restructure dataset list to match required inputs:

- Plan Period selector (mirrors header)
- Employee Roster (Reps / RMs / AMs)
- Geography Alignment (territory mapping + role definitions)
- Historical Sales (rep / territory / region rollup)
- Growth Rate (numeric input)
- Territory Potential (quarterly)
- Historical Goals (goals / attainment / payouts)
- Compensation Inputs (Rep / RM / AM target pay)
- MBO Library (type / description / definition)
- Market Share (Prior Year) — marked Optional

Update `src/lib/data-inputs.ts` dataset definitions.

## 5. Plan Builder

- Keep horizontal role tabs (Sales Rep / Regional Manager / Area Manager).
- **Add a Product tab strip** inside each role: Product A / B / C + "Add Product".
- Components live per (role, product) instead of per role.
- Numeric weight inputs only (already done). Validation: total = 100% per product, else error + disable Continue.
- **Remove**: Weight Balance sidebar, Detailed/Compact toggle, left utility panel, writer activation panels.
- Keep Add Component modal with validation.

## 6. Goal Setting

- Replace sliders with numeric inputs for all weights and growth factor.
- Three components, each shown as a card with: description, inputs, weight % (separated from inputs):
  - **Historical Sales**: historical period dropdown (defaults from plan period), growth factor numeric, formula display `Goal Contribution = Historical Sales × Growth Factor`.
  - **Territory Potential**: potential value, weight %.
  - **Equal Distribution**: shows `National Target ÷ # of Reps`, weight %.
- Right panel: live rep-level goal calculation breakdown + territory / region / national rollup.

## 7. Fairness Testing (moved to step 4)

Rewrite `src/routes/fairness.tsx` with 5 tests:

1. Goal Attainment Distribution (prev sales vs new goals)
2. Goal Growth % (avg / median / distribution)
3. Top vs Bottom Performer Analysis
4. High-Potential vs Low-Potential Territories
5. Goal Similarity / Variance Test

Each test card shows result + auto-generated recommendation with healthy / caution / warning indicator. Recommendations panel summarizing suggested weight adjustments (link back to Goal Setting).

## 8. Payout Curve Design (step 5)

- Update step number + prev (Fairness) / next (Reports).
- Keep curve visualization + Threshold/Target/Excellence + Add Inflexion Point (80/100/120/150/200).
- Remove payout cap controls and redundant payout tables.

## 9. Reports & Outputs (step 6)

New route `src/routes/reports.tsx` listing:

- Goal Report, Territory Report, MBO Report, Compensation Summary, Payout Report, IC Design Report

Each row: View / Download / Export PDF / Export Excel buttons (stubbed handlers + toast).

## Technical notes

- New context: `src/lib/plan-period.tsx` (provider in `__root.tsx`).
- Route files touched: `index.tsx`, `data-inputs.tsx`, `plan-builder.tsx`, `goal-setting.tsx`, `fairness.tsx`, `payout-curve.tsx`, new `reports.tsx`, `__root.tsx`, `PageHeader.tsx`.
- Routes removed from nav: `approval`, `simulation` (files kept but unlinked, or deleted if safe).
- `src/lib/data-inputs.ts` dataset list rewritten.
- All step indices in `PageHeader` updated (0=Home, 1=Data, 2=Plan, 3=Goal, 4=Fairness, 5=Payout, 6=Reports).

## Out of scope (confirm if needed)

- Real persistence of plan drafts (Save Draft will be a toast stub).
- Real PDF/Excel export (buttons stubbed with toast).
- Backend / Lovable Cloud — not enabled; everything stays client-side mock data.
