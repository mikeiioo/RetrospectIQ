import type { BuildingProfile } from './building-profiles'
import type { Prediction, Recommendation } from './predictions'

function ageBase(year: number | null): number {
  if (year === null) return 40
  if (year >= 2015) return 10
  if (year >= 2000) return 25
  if (year >= 1985) return 40
  if (year >= 1970) return 55
  return 65
}

function hvacAdj(hvac: string | null): number {
  if (!hvac) return 0
  const s = hvac.toLowerCase()
  if (s.includes('heat pump') || s.includes('vrf') || s.includes('mini-split')) return -10
  if (
    s.includes('rtu') ||
    s.includes('rooftop package') ||
    s.includes('packaged unit') ||
    s.includes('packaged rooftop')
  )
    return 15
  if (s.includes('boiler') || s.includes('chiller')) return 10
  return 0
}

function lightingAdj(lighting: string | null): number {
  if (!lighting) return 0
  const s = lighting.toLowerCase()
  if (s.includes('led')) return -15
  if (s.includes('fluorescent') || s.includes('incandescent') || s.includes('hid')) return 10
  return 0
}

function squareFootageAdj(squareFootage: number | null): number {
  if (squareFootage === null) return 0
  if (squareFootage >= 100_000) return 10
  if (squareFootage >= 50_000) return 7
  if (squareFootage >= 10_000) return 3
  if (squareFootage < 5_000) return -5
  return 0
}

function hasControlsUpgrade(upgrades: BuildingProfile['detectedUpgrades']): boolean {
  return upgrades.some(u => u.type === 'Controls')
}

function upgradeReduction(upgrades: BuildingProfile['detectedUpgrades']): number {
  const recent = upgrades.filter(u => u.year !== null && u.year >= 2015).length
  return Math.min(recent * 8, 30)
}

function priorityLabel(score: number): Prediction['priority'] {
  if (score <= 30) return 'Low'
  if (score <= 60) return 'Moderate'
  if (score <= 80) return 'High'
  return 'Critical'
}

function buildRecommendations(profile: BuildingProfile): Recommendation[] {
  const recs: Recommendation[] = []

  if (profile.lightingType) {
    const s = profile.lightingType.toLowerCase()
    if (s.includes('fluorescent') || s.includes('incandescent') || s.includes('hid')) {
      recs.push({
        name: 'LED Lighting Conversion',
        category: 'Lighting',
        priority: 'High',
        reason: `Current lighting (${profile.lightingType}) is significantly less efficient than LED.`,
      })
    }
  }

  if (profile.hvacSystem) {
    const s = profile.hvacSystem.toLowerCase()
    if (
      s.includes('rtu') ||
      s.includes('rooftop package') ||
      s.includes('packaged unit') ||
      s.includes('packaged rooftop') ||
      s.includes('boiler')
    ) {
      recs.push({
        name: 'High-Efficiency HVAC Upgrade',
        category: 'HVAC',
        priority: 'High',
        reason: `Current system (${profile.hvacSystem}) is a strong candidate for high-efficiency replacement.`,
      })
    }
  }

  if (!hasControlsUpgrade(profile.detectedUpgrades)) {
    recs.push({
      name: 'Smart Occupancy Controls',
      category: 'Controls',
      priority: 'Medium',
      reason: 'No controls upgrade detected. Occupancy-based controls typically reduce energy use 15–25%.',
    })
    recs.push({
      name: 'Building Automation System',
      category: 'Automation',
      priority: 'Medium',
      reason:
        'No building automation detected. A BAS integrates HVAC, lighting, and controls for optimized energy management.',
    })
  }

  const nullCount = [
    profile.buildingYear,
    profile.buildingType,
    profile.squareFootage,
    profile.hvacSystem,
    profile.lightingType,
    profile.electricalService,
  ].filter(v => v === null).length

  if (nullCount >= 3) {
    recs.push({
      name: 'Professional Energy Audit',
      category: 'Audit',
      priority: 'High',
      reason:
        'Insufficient data in permit to fully assess retrofit potential. A professional audit would provide accurate baselines.',
    })
  }

  return recs
}

export function computeRetrofitScore(
  profile: BuildingProfile
): Omit<Prediction, 'permitId' | 'generatedAt'> {
  let score = ageBase(profile.buildingYear)
  const hAdj = hvacAdj(profile.hvacSystem)
  score += hAdj
  score += lightingAdj(profile.lightingType)
  score += squareFootageAdj(profile.squareFootage)

  // Controls penalty applied independently; skip if HVAC already contributes a positive penalty
  // (prevents double-penalizing old HVAC systems whose controls status is unknown)
  if (!hasControlsUpgrade(profile.detectedUpgrades) && hAdj <= 0) {
    score += 10
  }

  score -= upgradeReduction(profile.detectedUpgrades)
  score = Math.max(0, Math.min(100, score))

  const sqft = profile.squareFootage
  const estimatedAnnualSavings = sqft
    ? Math.round((sqft * 1.2 * (score / 100)) / 100) * 100
    : score * 400

  return {
    retrofitImpactScore: score,
    priority: priorityLabel(score),
    estimatedEnergyReductionPercent: Math.round(score * 0.4),
    estimatedAnnualSavings,
    estimatedCarbonReductionTons: Math.round(estimatedAnnualSavings / 180),
    recommendations: buildRecommendations(profile),
    modelType: 'prototype_rule_based',
  }
}
