// Fairness recommendation storage (client-side)
// Persists recommended weight and growth adjustments so they can be
// auto-applied in Goal Setting and Monte Carlo Simulation.

export type FairnessRecommendation = {
  appliedAt: number;
  wHist: number;
  wPot: number;
  wEqual: number;
  growthPercent: number; // e.g. 10 = 10%
  variability: number;
  reason: string[];
};

const STORAGE_KEY = "helix:fairness-recommendations";

export function computeRecommendations(
  performerGapPts: number,
  highGrowthOutliers: number,
  medianGrowthPct: number,
): FairnessRecommendation {
  const reasons: string[] = [];

  // Base values from current Goal Setting defaults
  let wHist = 50;
  let wPot = 30;
  let wEqual = 20;

  // Performer fairness fix: shift weight from historical → potential
  if (performerGapPts >= 20) {
    wHist -= 10;
    wPot += 10;
    reasons.push("Shifted weight from Historical Sales to Territory Potential to reduce quartile gap.");
  }

  // Goal growth fairness fix: increase equal component when growth varies wildly
  if (highGrowthOutliers > 2) {
    wEqual += 10;
    wHist -= 5;
    wPot -= 5;
    reasons.push("Increased Equal Distribution to smooth out high-growth outliers.");
  }

  // Normalize to 100%
  const total = wHist + wPot + wEqual;
  if (total !== 100) {
    const diff = 100 - total;
    wPot += diff; // absorb rounding in potential
  }

  // Growth: target ~10%; reduce if median is too high
  let growthPercent = 10;
  if (medianGrowthPct > 15) {
    growthPercent = 8;
    reasons.push("Reduced growth assumption to rein in goal inflation.");
  } else if (medianGrowthPct > 12) {
    growthPercent = 9;
    reasons.push("Slightly reduced growth assumption to keep goals attainable.");
  }

  // Variability: if performer gap is high, reps behave more heterogeneously
  let variability = 18;
  if (performerGapPts >= 20) {
    variability = 22;
    reasons.push("Raised variability to reflect wider rep performance spread.");
  }

  return {
    appliedAt: Date.now(),
    wHist: Math.max(0, Math.min(100, wHist)),
    wPot: Math.max(0, Math.min(100, wPot)),
    wEqual: Math.max(0, Math.min(100, wEqual)),
    growthPercent,
    variability,
    reason: reasons,
  };
}

export function storeRecommendations(rec: FairnessRecommendation) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
  }
}

export function loadRecommendations(): FairnessRecommendation | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FairnessRecommendation;
  } catch {
    return null;
  }
}

export function clearRecommendations() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
