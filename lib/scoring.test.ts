import { describe, it, expect } from 'vitest'
import { computeRetrofitScore } from './scoring'
import type { BuildingProfile } from './building-profiles'

const base: BuildingProfile = {
  permitId: 'test',
  buildingYear: null,
  buildingType: null,
  squareFootage: null,
  hvacSystem: null,
  lightingType: null,
  electricalService: null,
  detectedUpgrades: [],
  confidenceScores: {},
  extractedAt: new Date(),
}

describe('computeRetrofitScore', () => {
  describe('base score from age', () => {
    it('scores pre-1970 building with no other data', () => {
      // base=65, no HVAC/lighting adj, controls penalty +10 (hvacAdj=0≤0), no upgrades → 75
      const r = computeRetrofitScore({ ...base, buildingYear: 1965 })
      expect(r.retrofitImpactScore).toBe(75)
      expect(r.priority).toBe('High')
    })

    it('scores 2020 building with no other data', () => {
      // base=10, controls penalty +10 (hvacAdj=0≤0) → 20
      const r = computeRetrofitScore({ ...base, buildingYear: 2020 })
      expect(r.retrofitImpactScore).toBe(20)
      expect(r.priority).toBe('Low')
    })

    it('uses 40 for unknown year', () => {
      // base=40, controls penalty +10 → 50
      const r = computeRetrofitScore({ ...base })
      expect(r.retrofitImpactScore).toBe(50)
      expect(r.priority).toBe('Moderate')
    })
  })

  describe('HVAC adjustment', () => {
    it('adds 15 for old RTU; skips controls penalty', () => {
      // base=40, hvacAdj=+15, hvacAdj>0 so no controls penalty → 55
      const r = computeRetrofitScore({ ...base, hvacSystem: 'Rooftop Package Unit' })
      expect(r.retrofitImpactScore).toBe(55)
    })

    it('adds 10 for boiler; skips controls penalty', () => {
      // base=40, hvacAdj=+10 → 50
      const r = computeRetrofitScore({ ...base, hvacSystem: 'Gas Boiler' })
      expect(r.retrofitImpactScore).toBe(50)
    })

    it('subtracts 10 for heat pump; applies controls penalty', () => {
      // base=40, hvacAdj=-10, controls +10 → 40
      const r = computeRetrofitScore({ ...base, hvacSystem: 'Heat Pump' })
      expect(r.retrofitImpactScore).toBe(40)
    })
  })

  describe('lighting adjustment', () => {
    it('adds 10 for fluorescent', () => {
      // base=40, lightingAdj=+10, controls +10 (hvacAdj=0≤0) → 60
      const r = computeRetrofitScore({ ...base, lightingType: 'Fluorescent' })
      expect(r.retrofitImpactScore).toBe(60)
    })

    it('subtracts 15 for LED', () => {
      // base=40, lightingAdj=-15, controls +10 → 35
      const r = computeRetrofitScore({ ...base, lightingType: 'LED' })
      expect(r.retrofitImpactScore).toBe(35)
    })
  })

  describe('controls penalty', () => {
    it('does not apply controls penalty when Controls upgrade exists', () => {
      // year: null so no upgrade reduction — isolates controls penalty behavior
      // base=40, hvacAdj=0, Controls upgrade present → no controls penalty, no reduction → 40
      const withControls = computeRetrofitScore({
        ...base,
        detectedUpgrades: [{ type: 'Controls', description: 'BAS installed', year: null }],
      })
      // base=40, hvacAdj=0≤0, no controls upgrade → +10 controls penalty → 50
      const withoutControls = computeRetrofitScore({ ...base })
      expect(withControls.retrofitImpactScore).toBe(40)
      expect(withoutControls.retrofitImpactScore).toBe(50)
    })

    it('does not apply controls penalty when old HVAC is already penalized', () => {
      // Old RTU (hvacAdj=+15 > 0) → no controls penalty
      const r = computeRetrofitScore({ ...base, hvacSystem: 'Rooftop Package Unit' })
      expect(r.retrofitImpactScore).toBe(55) // 40+15, not 40+15+10
    })
  })

  describe('recent upgrade reduction', () => {
    it('reduces score by 8 per upgrade with year >= 2015', () => {
      // base=40, controls +10 → 50, minus 2 recent upgrades: 50 - 16 = 34
      const r = computeRetrofitScore({
        ...base,
        detectedUpgrades: [
          { type: 'Lighting', description: 'LED retrofit', year: 2019 },
          { type: 'HVAC', description: 'New heat pump', year: 2022 },
        ],
      })
      expect(r.retrofitImpactScore).toBe(34)
    })

    it('does not reduce score for upgrades with null year', () => {
      // base=40, controls +10 → 50 (no reduction for null year)
      const r = computeRetrofitScore({
        ...base,
        detectedUpgrades: [{ type: 'HVAC', description: 'Upgrade', year: null }],
      })
      expect(r.retrofitImpactScore).toBe(50)
    })

    it('caps upgrade reduction at 30', () => {
      // 5 recent upgrades = 5*8=40 → capped at 30; base=40, controls+10 → 50-30=20
      const r = computeRetrofitScore({
        ...base,
        detectedUpgrades: [
          { type: 'HVAC', description: 'A', year: 2018 },
          { type: 'Lighting', description: 'B', year: 2019 },
          { type: 'Electrical', description: 'C', year: 2020 },
          { type: 'Envelope', description: 'D', year: 2021 },
          { type: 'Controls', description: 'E', year: 2022 },
        ],
      })
      // Controls upgrade present → no controls penalty; 5 recent upgrades capped at 30
      // base=40 + 0 hvac + 0 lighting + 0 controls_penalty - 30 = 10
      expect(r.retrofitImpactScore).toBe(10)
    })

    it('clamps score to 0 minimum', () => {
      const r = computeRetrofitScore({
        ...base,
        buildingYear: 2022,
        hvacSystem: 'VRF System',
        lightingType: 'LED',
        detectedUpgrades: [
          { type: 'HVAC', description: 'A', year: 2022 },
          { type: 'Controls', description: 'B', year: 2022 },
        ],
      })
      expect(r.retrofitImpactScore).toBeGreaterThanOrEqual(0)
    })

    it('clamps score to 100 maximum', () => {
      const r = computeRetrofitScore({
        ...base,
        buildingYear: 1950,
        hvacSystem: 'Old Boiler',
        lightingType: 'Incandescent',
      })
      expect(r.retrofitImpactScore).toBeLessThanOrEqual(100)
    })
  })

  describe('estimated outputs', () => {
    it('uses sqft-based savings formula when sqft is known', () => {
      const r = computeRetrofitScore({ ...base, buildingYear: 1980, squareFootage: 10000 })
      // score = base55 + controls+10 = 65; savings = 10000 * 1.2 * (65/100) = 7800 → rounded to 7800
      expect(r.estimatedAnnualSavings).toBe(7800)
    })

    it('falls back to score*400 when sqft is unknown', () => {
      const r = computeRetrofitScore({ ...base, buildingYear: 1980 })
      // score=55+10=65; savings = 65*400 = 26000 → rounded to 26000
      expect(r.estimatedAnnualSavings).toBe(26000)
    })

    it('sets energy reduction to score * 0.4', () => {
      const r = computeRetrofitScore({ ...base, buildingYear: 2000 })
      // score = base25 + controls+10 = 35
      expect(r.estimatedEnergyReductionPercent).toBe(Math.round(35 * 0.4))
    })
  })

  describe('recommendations', () => {
    it('recommends LED conversion for fluorescent lighting', () => {
      const r = computeRetrofitScore({ ...base, lightingType: 'Fluorescent T8' })
      expect(r.recommendations.some(rec => rec.category === 'Lighting')).toBe(true)
    })

    it('recommends HVAC upgrade for old packaged unit', () => {
      const r = computeRetrofitScore({ ...base, hvacSystem: 'Packaged Rooftop Unit' })
      expect(r.recommendations.some(rec => rec.category === 'HVAC')).toBe(true)
    })

    it('recommends controls and automation when no upgrade detected', () => {
      const r = computeRetrofitScore({ ...base })
      expect(r.recommendations.some(rec => rec.category === 'Controls')).toBe(true)
      expect(r.recommendations.some(rec => rec.category === 'Automation')).toBe(true)
    })

    it('does not recommend controls when Controls upgrade exists', () => {
      const r = computeRetrofitScore({
        ...base,
        detectedUpgrades: [{ type: 'Controls', description: 'BAS', year: 2021 }],
      })
      expect(r.recommendations.some(rec => rec.category === 'Controls')).toBe(false)
      expect(r.recommendations.some(rec => rec.category === 'Automation')).toBe(false)
    })

    it('recommends Professional Audit when 3+ fields are null', () => {
      // base has 6 null fields
      const r = computeRetrofitScore({ ...base })
      expect(r.recommendations.some(rec => rec.category === 'Audit')).toBe(true)
    })

    it('does not recommend audit when enough fields are known', () => {
      const r = computeRetrofitScore({
        ...base,
        buildingYear: 1985,
        buildingType: 'Office',
        squareFootage: 20000,
        hvacSystem: 'RTU',
      })
      expect(r.recommendations.some(rec => rec.category === 'Audit')).toBe(false)
    })
  })
})
