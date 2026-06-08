## Goal
Bring the IC Design app in line with the feedback from the call (Supriya's review). Five focused refactors across existing screens. No new backend.

## 1. Data Inputs (Step 0) — convert from numbers to datasets
Replace the three singular numeric inputs (Previous Year Sales $M, # Reps, Territory Potential $M) with a **dataset ingestion checklist** that reflects how the data actually arrives.

Datasets shown as cards with status (Validated / Warning / Missing), row count, last updated, and a mock "Upload / Replace" action:
- HCP Historical Sales (HCP-level, time-stamped)
- Territory Alignment (source of # of reps — pulled from IC Admin)
- Sales Managers & Sales Reps roster
- Territory Potential (competitor units per HCP; falls back to territory-level sales)
- MBO Definitions (synced from IC Admin)

A "Continue to Plan Builder" CTA gates on all required datasets being Validated. Drop the manual number inputs entirely; downstream screens read aggregates from a small mock dataset module instead of `localStorage` numbers.

## 2. Goal Setting — 3-component weighted model
Rebuild the Goal Setting screen around the three components with user-defined weights:
- **Historical Component** (with growth factor)
- **Territory Potential Component**
- **Equal Distribution Component** (national total ÷ reps)

Rules:
- Weight sliders/inputs must sum to 100% (any split allowed, including 0%). Show a live validation banner; block Continue with a popup if ≠ 100%.
- **Historical period selector** (FY, last 4Q, prior-year same quarter, custom range) drives which window feeds the Historical component.
- Rename "Historical Weight" / "Potential Weight" labels → "Historical Component" / "Potential Component".
- Output preview table shows **differentiated** rep/territory goals (no uniform values); RM/AM rollups derived from rep rows.

## 3. Plan Builder — slim down for the demo
- Remove the "New Writer Activation" component entirely; keep only **Goal Attainment** and **MBOs**.
- Component % inputs must sum to 100%; show inline warning + popup if user tries to advance with an invalid sum.
- Remove the left-side **Plan Health** and **Territory Allocation** panels on this screen.
- MBO list pulled from a mocked "IC Admin MBO definitions" source (shared with Data Inputs dataset list).

## 4. Payout Curve — direct inputs, flexible inflexion points
- Replace sliders with **numeric input fields** for Attainment % and Payout % at each inflexion point.
- Add **"+ Add inflexion point"** button (and remove button per row). Names are editable.
- Allow values >100% (no clamping); show curve preview with whatever the user enters.
- **Remove the redundant table below the chart** — inputs ARE the table.
- Keep the curve preview chart on the right.

## 5. Approval / Reporting — strip workflow, keep report
- Remove **Plan Health**, **Simulation Risk**, **Decision Confidence** sections.
- Reframe page as **"Plan Summary & Export"**: read-only summary of Goals, MBOs, Payout Curve, plus prominent **Download Report (PDF/XLSX)** and **Export to IC Admin (coming soon)** actions.
- Rename route label from "Approval" to "Plan Summary" in the left nav.

## Out of scope (deferred per the call)
- Live wiring to IC Admin
- Real file parsing/upload
- Save-draft refactor (will revisit; current per-step Save stays for now)
- Fairness Testing rework (Simulation page) — flag as next iteration

## Technical notes
- New module `src/lib/datasets.ts` replaces `src/lib/data-inputs.ts` with a typed list of mocked dataset records (status, rowCount, updatedAt, derived aggregates like totalPYSales, repCount, totalPotential).
- `src/routes/data-inputs.tsx` rewritten as the dataset checklist.
- `src/routes/goal-setting.tsx` rewritten around `{ weightHistorical, weightPotential, weightEqual, growthFactor, historicalPeriod }` state with validation.
- `src/routes/plan-builder.tsx`: delete New Writer Activation block, Plan Health + Territory Allocation panels; add sum-to-100 guard on Continue.
- `src/routes/payout-curve.tsx`: refactor to an editable rows model `Array<{ name, attainment, payout }>`; chart reads from rows; delete the secondary table.
- `src/routes/approval.tsx`: strip risk/health/confidence; add Export actions (mocked).
- Left nav label "Approval" → "Plan Summary" in `src/routes/__root.tsx`.
