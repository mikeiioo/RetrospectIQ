import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MongoClient, ObjectId } from 'mongodb'

const DEMO_NOW = new Date('2026-06-01T14:00:00.000Z')
const EXTRACTED_AT = new Date('2026-06-01T14:05:00.000Z')
const GENERATED_AT = new Date('2026-06-01T14:08:00.000Z')

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  let file
  try {
    file = readFileSync(envPath, 'utf8')
  } catch {
    return
  }

  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] ??= value
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function rawTextFor(building) {
  return [
    `Building permit and modernization summary for ${building.name}.`,
    `Address: ${building.address}.`,
    `Building Type: ${building.profile.buildingType}.`,
    `Year Built: ${building.profile.buildingYear}.`,
    `Building Area: ${building.profile.squareFootage} square feet.`,
    `HVAC System: ${building.profile.hvacSystem}.`,
    `Lighting Type: ${building.profile.lightingType}.`,
    `Electrical Service: ${building.profile.electricalService}.`,
    `Detected permit upgrades: ${building.profile.detectedUpgrades
      .map(upgrade => `${upgrade.type} - ${upgrade.description} (${upgrade.year ?? 'year unknown'})`)
      .join('; ') || 'None listed'}.`,
    'This deterministic demo text is seeded for RetrospectIQ portfolio walkthroughs.',
  ].join('\n\n')
}

const demoBuildings = [
  {
    id: '665000000000000000000101',
    name: 'Candler Building Office Tower',
    address: '127 Peachtree St NE, Atlanta, GA 30303',
    s3Key: 'permits/demo/candler-office-tower-2024.pdf',
    originalFilename: 'candler-office-tower-mechanical-permit.pdf',
    uploadedAt: new Date('2026-05-28T15:30:00.000Z'),
    sizeBytes: 482_944,
    profile: {
      buildingYear: 1906,
      buildingType: 'Office',
      squareFootage: 118000,
      hvacSystem: 'Aging central boiler and packaged rooftop air handlers',
      lightingType: 'Fluorescent T8 fixtures in tenant corridors and offices',
      electricalService: '2400 amp, 480Y/277V electrical service',
      detectedUpgrades: [
        {
          type: 'Electrical',
          description: 'Main switchgear replacement and panelboard upgrades',
          year: 2017,
        },
      ],
      confidenceScores: {
        buildingYear: 0.98,
        buildingType: 0.93,
        squareFootage: 0.9,
        hvacSystem: 0.86,
        lightingType: 0.91,
      },
    },
    prediction: {
      retrofitImpactScore: 92,
      priority: 'Critical',
      estimatedEnergyReductionPercent: 37,
      estimatedAnnualSavings: 128800,
      estimatedCarbonReductionTons: 716,
      recommendations: [
        {
          name: 'LED Lighting Conversion',
          category: 'Lighting',
          priority: 'High',
          reason: 'Fluorescent tenant lighting remains a high-confidence retrofit opportunity.',
        },
        {
          name: 'High-Efficiency HVAC Upgrade',
          category: 'HVAC',
          priority: 'High',
          reason: 'Aging boiler and packaged air handlers indicate significant HVAC savings potential.',
        },
        {
          name: 'Building Automation System',
          category: 'Automation',
          priority: 'Medium',
          reason: 'No building automation upgrade was detected in the permit history.',
        },
      ],
    },
  },
  {
    id: '665000000000000000000102',
    name: 'Old Fourth Ward Adaptive Reuse Lofts',
    address: '675 Ponce De Leon Ave NE, Atlanta, GA 30308',
    s3Key: 'permits/demo/old-fourth-ward-lofts-2023.pdf',
    originalFilename: 'old-fourth-ward-adaptive-reuse-permit.pdf',
    uploadedAt: new Date('2026-05-29T16:00:00.000Z'),
    sizeBytes: 391_280,
    profile: {
      buildingYear: 1926,
      buildingType: 'Mixed-use',
      squareFootage: 86000,
      hvacSystem: 'High-efficiency heat pump loop with dedicated outside air system',
      lightingType: 'LED fixtures in retail and residential common areas',
      electricalService: '1600 amp electrical service with submetering',
      detectedUpgrades: [
        {
          type: 'HVAC',
          description: 'Heat pump loop modernization',
          year: 2022,
        },
        {
          type: 'Lighting',
          description: 'LED common-area retrofit',
          year: 2021,
        },
        {
          type: 'Controls',
          description: 'Tenant energy monitoring controls',
          year: 2023,
        },
      ],
      confidenceScores: {
        buildingYear: 0.92,
        buildingType: 0.86,
        squareFootage: 0.88,
        hvacSystem: 0.9,
        lightingType: 0.94,
      },
    },
    prediction: {
      retrofitImpactScore: 24,
      priority: 'Low',
      estimatedEnergyReductionPercent: 10,
      estimatedAnnualSavings: 24800,
      estimatedCarbonReductionTons: 138,
      recommendations: [
        {
          name: 'Professional Energy Audit',
          category: 'Audit',
          priority: 'Low',
          reason: 'Recent HVAC, LED, and controls upgrades reduce immediate retrofit opportunity.',
        },
      ],
    },
  },
  {
    id: '665000000000000000000103',
    name: 'Westside Logistics Warehouse',
    address: '1530 Marietta Blvd NW, Atlanta, GA 30318',
    s3Key: 'permits/demo/westside-logistics-warehouse-2022.pdf',
    originalFilename: 'westside-logistics-warehouse-electrical.pdf',
    uploadedAt: new Date('2026-05-30T13:45:00.000Z'),
    sizeBytes: 512_104,
    profile: {
      buildingYear: 1998,
      buildingType: 'Industrial warehouse',
      squareFootage: 142000,
      hvacSystem: 'Packaged rooftop units serving office mezzanine and gas unit heaters in warehouse',
      lightingType: 'High-intensity discharge warehouse lighting',
      electricalService: '2000 amp, 480V three-phase service',
      detectedUpgrades: [
        {
          type: 'Electrical',
          description: 'Dock equipment electrical branch circuits',
          year: 2020,
        },
      ],
      confidenceScores: {
        buildingYear: 0.87,
        buildingType: 0.91,
        squareFootage: 0.89,
        hvacSystem: 0.82,
        lightingType: 0.88,
      },
    },
    prediction: {
      retrofitImpactScore: 82,
      priority: 'Critical',
      estimatedEnergyReductionPercent: 33,
      estimatedAnnualSavings: 139700,
      estimatedCarbonReductionTons: 776,
      recommendations: [
        {
          name: 'LED Lighting Conversion',
          category: 'Lighting',
          priority: 'High',
          reason: 'HID warehouse lighting is a strong candidate for high-bay LED conversion.',
        },
        {
          name: 'Smart Occupancy Controls',
          category: 'Controls',
          priority: 'Medium',
          reason: 'No occupancy or daylighting controls were detected for warehouse zones.',
        },
        {
          name: 'High-Efficiency HVAC Upgrade',
          category: 'HVAC',
          priority: 'High',
          reason: 'Packaged rooftop equipment and gas unit heaters suggest remaining HVAC opportunity.',
        },
      ],
    },
  },
  {
    id: '665000000000000000000104',
    name: 'Midtown Medical Office Building',
    address: '1100 Peachtree St NE, Atlanta, GA 30309',
    s3Key: 'permits/demo/midtown-medical-office-2024.pdf',
    originalFilename: 'midtown-medical-office-renovation.pdf',
    uploadedAt: new Date('2026-05-31T17:20:00.000Z'),
    sizeBytes: 438_512,
    profile: {
      buildingYear: 2008,
      buildingType: 'Medical office',
      squareFootage: 64000,
      hvacSystem: 'Rooftop package units with VAV terminal boxes',
      lightingType: 'Mixed LED and fluorescent fixtures',
      electricalService: '1800 amp service with emergency generator transfer switch',
      detectedUpgrades: [
        {
          type: 'Lighting',
          description: 'Partial LED conversion in clinical suites',
          year: 2020,
        },
        {
          type: 'HVAC',
          description: 'VAV controls replacement for two floors',
          year: 2019,
        },
      ],
      confidenceScores: {
        buildingYear: 0.85,
        buildingType: 0.89,
        squareFootage: 0.83,
        hvacSystem: 0.8,
        lightingType: 0.82,
      },
    },
    prediction: {
      retrofitImpactScore: 54,
      priority: 'Moderate',
      estimatedEnergyReductionPercent: 22,
      estimatedAnnualSavings: 41400,
      estimatedCarbonReductionTons: 230,
      recommendations: [
        {
          name: 'LED Lighting Conversion',
          category: 'Lighting',
          priority: 'Medium',
          reason: 'Permit text suggests a partial LED conversion, leaving remaining fluorescent areas.',
        },
        {
          name: 'Building Automation System',
          category: 'Automation',
          priority: 'Medium',
          reason: 'No whole-building automation platform was detected for scheduling and optimization.',
        },
      ],
    },
  },
]

const scannedPermit = {
  _id: new ObjectId('665000000000000000000105'),
  buildingName: 'Edgewood Community Center',
  address: '1503 Hardee St NE, Atlanta, GA 30307',
  s3Key: 'permits/demo/edgewood-community-center-scanned.pdf',
  originalFilename: 'edgewood-community-center-scanned-permit.pdf',
  sizeBytes: 288_600,
  contentType: 'application/pdf',
  uploadedAt: new Date('2026-06-01T12:00:00.000Z'),
  status: 'scanned_pdf',
  rawText: '',
  textExtraction: {
    status: 'scanned_pdf',
    characterCount: 0,
    extractedAt: EXTRACTED_AT,
  },
}

function buildPermit(building) {
  const rawText = rawTextFor(building)
  return {
    _id: new ObjectId(building.id),
    buildingName: building.name,
    address: building.address,
    s3Key: building.s3Key,
    originalFilename: building.originalFilename,
    sizeBytes: building.sizeBytes,
    contentType: 'application/pdf',
    uploadedAt: building.uploadedAt,
    status: 'scored',
    rawText,
    textExtraction: {
      status: 'completed',
      characterCount: rawText.replace(/\s/g, '').length,
      extractedAt: EXTRACTED_AT,
    },
  }
}

function buildProfile(building) {
  return {
    permitId: building.id,
    ...building.profile,
    extractedAt: EXTRACTED_AT,
  }
}

function buildPrediction(building) {
  return {
    permitId: building.id,
    ...building.prediction,
    modelType: 'prototype_rule_based',
    generatedAt: GENERATED_AT,
  }
}

loadEnvLocal()

const client = new MongoClient(requireEnv('MONGODB_URI'))
const seedIds = [...demoBuildings.map(building => building.id), scannedPermit._id.toString()]

try {
  await client.connect()
  const db = client.db()
  const permits = db.collection('permits')
  const profiles = db.collection('building_profiles')
  const predictions = db.collection('predictions')

  await permits.deleteMany({ _id: { $in: seedIds.map(id => new ObjectId(id)) } })
  await profiles.deleteMany({ permitId: { $in: seedIds } })
  await predictions.deleteMany({ permitId: { $in: seedIds } })

  await permits.insertMany([...demoBuildings.map(buildPermit), scannedPermit])
  await profiles.insertMany(demoBuildings.map(buildProfile))
  await predictions.insertMany(demoBuildings.map(buildPrediction))

  console.log('RetrospectIQ demo seed complete')
  console.log(`Database: ${db.databaseName}`)
  console.log(`Permits: ${seedIds.length}`)
  console.log(`Building profiles: ${demoBuildings.length}`)
  console.log(`Predictions: ${demoBuildings.length}`)
  console.log(`Seed timestamp: ${DEMO_NOW.toISOString()}`)
  console.log('Demo permit IDs:')
  for (const building of demoBuildings) {
    console.log(`- ${building.id} ${building.name}`)
  }
  console.log(`- ${scannedPermit._id.toString()} ${scannedPermit.buildingName} (scanned_pdf)`)
} finally {
  await client.close()
}
