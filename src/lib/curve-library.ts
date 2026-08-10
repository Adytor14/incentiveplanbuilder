// Curve Library — saved payout curve templates.
// Presets are always available; user-saved curves persist in localStorage.

export type CurvePoint = { id: string; name: string; attainment: number; payout: number };

export type SavedCurve = {
  id: string;
  name: string;
  description: string;
  preset: boolean;
  savedAt: number;
  points: CurvePoint[];
};

const STORAGE_KEY = "helix:curve-library";

const pt = (name: string, attainment: number, payout: number): CurvePoint => ({
  id: `${name}-${attainment}`,
  name,
  attainment,
  payout,
});

export const CURVE_PRESETS: SavedCurve[] = [
  {
    id: "preset-standard",
    name: "Standard Linear",
    description: "80% threshold · 100% target · 150% excellence",
    preset: true,
    savedAt: 0,
    points: [pt("Threshold", 80, 50), pt("Target", 100, 100), pt("Excellence", 120, 150), pt("Stretch", 150, 200)],
  },
  {
    id: "preset-accelerated",
    name: "Accelerated Upside",
    description: "Steeper payout above target to reward overachievement",
    preset: true,
    savedAt: 0,
    points: [pt("Threshold", 85, 40), pt("Target", 100, 100), pt("Excellence", 120, 175), pt("Stretch", 140, 250)],
  },
  {
    id: "preset-conservative",
    name: "Conservative / Budget-Safe",
    description: "Flatter slope, capped upside for tight budgets",
    preset: true,
    savedAt: 0,
    points: [pt("Threshold", 90, 60), pt("Target", 100, 100), pt("Excellence", 120, 130), pt("Cap", 150, 150)],
  },
];

export function loadCurveLibrary(): SavedCurve[] {
  if (typeof window === "undefined") return CURVE_PRESETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as SavedCurve[]) : [];
    return [...CURVE_PRESETS, ...saved];
  } catch {
    return CURVE_PRESETS;
  }
}

export function saveCurve(name: string, points: CurvePoint[]): SavedCurve {
  const curve: SavedCurve = {
    id: `curve-${Date.now()}`,
    name,
    description: `${points.length} inflexion points · max payout ${Math.max(...points.map((p) => p.payout))}%`,
    preset: false,
    savedAt: Date.now(),
    points,
  };
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as SavedCurve[]) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved, curve]));
  }
  return curve;
}

export function deleteCurve(id: string) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  const saved = raw ? (JSON.parse(raw) as SavedCurve[]) : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.filter((c) => c.id !== id)));
}
