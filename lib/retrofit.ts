export interface RetrofitIntelligence {
  impactScore: number;
  energyReductionPctLow: number;
  energyReductionPctHigh: number;
  estimatedAnnualSavingsUsd: number;
  carbonReductionTonsPerYear: number;
  recommendedUpgrades: string[];
}

const UPGRADES = [
  "LED lighting retrofit",
  "Heat pump HVAC upgrade",
  "Window glazing replacement",
  "Roof insulation upgrade",
  "Smart thermostat installation",
  "Solar PV array (10 kW)",
  "EV charging stations (Level 2)",
  "Variable-frequency drives on circulation pumps",
  "Demand-controlled ventilation",
  "Building envelope air sealing",
];

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function xorshift32(seed: number): number {
  let x = seed || 0x9e3779b9;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}

export function makeRetrofitIntelligence(permitId: string): RetrofitIntelligence {
  let seed = fnv1a(permitId);

  const pick = (min: number, max: number): number => {
    seed = xorshift32(seed);
    return min + (seed % (max - min + 1));
  };

  const impactScore = pick(55, 92);
  const energyLow = pick(12, 22);
  const energyHigh = energyLow + pick(4, 10);
  const savings = pick(8000, 64000);
  const carbon = pick(15, 180);

  const upgrades: string[] = [];
  const used = new Set<number>();
  while (upgrades.length < 3 && used.size < UPGRADES.length) {
    const idx = pick(0, UPGRADES.length - 1);
    if (!used.has(idx)) {
      used.add(idx);
      upgrades.push(UPGRADES[idx]);
    }
  }

  return {
    impactScore,
    energyReductionPctLow: energyLow,
    energyReductionPctHigh: energyHigh,
    estimatedAnnualSavingsUsd: Math.round(savings / 100) * 100,
    carbonReductionTonsPerYear: carbon,
    recommendedUpgrades: upgrades,
  };
}
