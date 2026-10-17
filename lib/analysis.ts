import OpenAI from 'openai'
import { openaiApiKey } from './env'
import { getPermitById, updatePermit } from './permits'
import { upsertBuildingProfile, type BuildingProfile } from './building-profiles'

export type AnalysisResult = {
  outcome: 'completed' | 'skipped' | 'failed'
  error?: string
}

const SYSTEM_PROMPT = `You are a building systems analyst. Extract structured information from building permit text.

Rules:
- Extract ONLY facts explicitly stated in the permit text
- Use null for any field not mentioned or unclear
- For detectedUpgrades, include only work explicitly described as an upgrade or replacement
- For years in detectedUpgrades, use the year only if explicitly stated; otherwise null
- Do not infer, guess, or hallucinate values
- Confidence scores (0.0–1.0) reflect how clearly the information appears in the text

Respond with valid JSON matching this exact schema:
{
  "buildingYear": number | null,
  "buildingType": string | null,
  "squareFootage": number | null,
  "hvacSystem": string | null,
  "lightingType": string | null,
  "electricalService": string | null,
  "detectedUpgrades": [{ "type": "HVAC"|"Lighting"|"Electrical"|"Envelope"|"Controls"|"Other", "description": string, "year": number | null }],
  "confidenceScores": { [field: string]: number }
}`

const UPGRADE_TYPES = ['HVAC', 'Lighting', 'Electrical', 'Envelope', 'Controls', 'Other'] as const

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeDetectedUpgrades(value: unknown): BuildingProfile['detectedUpgrades'] {
  if (!Array.isArray(value)) return []

  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const record = item as Record<string, unknown>
    const type = UPGRADE_TYPES.includes(record.type as (typeof UPGRADE_TYPES)[number])
      ? (record.type as BuildingProfile['detectedUpgrades'][number]['type'])
      : 'Other'
    const description = stringOrNull(record.description)
    if (!description) return []

    return [
      {
        type,
        description,
        year: numberOrNull(record.year),
      },
    ]
  })
}

function normalizeConfidenceScores(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === 'number' && Number.isFinite(entry[1])
    )
  )
}

function getClient(): OpenAI {
  return new OpenAI({ apiKey: openaiApiKey() })
}

export async function analyzePermit(permitId: string): Promise<AnalysisResult> {
  const permit = await getPermitById(permitId)
  if (!permit) throw new Error(`Permit not found: ${permitId}`)

  if (!permit.rawText || permit.textExtraction?.status !== 'completed') {
    return { outcome: 'skipped' }
  }

  const client = getClient()
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Extract building information from this permit text:\n\n${permit.rawText}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('OpenAI returned empty response')

  const data = JSON.parse(content) as Partial<BuildingProfile>

  const profile: BuildingProfile = {
    permitId,
    buildingYear: numberOrNull(data.buildingYear),
    buildingType: stringOrNull(data.buildingType),
    squareFootage: numberOrNull(data.squareFootage),
    hvacSystem: stringOrNull(data.hvacSystem),
    lightingType: stringOrNull(data.lightingType),
    electricalService: stringOrNull(data.electricalService),
    detectedUpgrades: normalizeDetectedUpgrades(data.detectedUpgrades),
    confidenceScores: normalizeConfidenceScores(data.confidenceScores),
    extractedAt: new Date(),
  }

  await upsertBuildingProfile(profile)
  await updatePermit(permitId, { status: 'analyzed' })

  return { outcome: 'completed' }
}
