import OpenAI from 'openai'
import { openaiApiKey } from './env'
import { getPermit, updatePermit } from './permits'
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

function getClient(): OpenAI {
  return new OpenAI({ apiKey: openaiApiKey() })
}

export async function analyzePermit(permitId: string): Promise<AnalysisResult> {
  const permit = await getPermit(permitId)
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
    buildingYear: data.buildingYear ?? null,
    buildingType: data.buildingType ?? null,
    squareFootage: data.squareFootage ?? null,
    hvacSystem: data.hvacSystem ?? null,
    lightingType: data.lightingType ?? null,
    electricalService: data.electricalService ?? null,
    detectedUpgrades: Array.isArray(data.detectedUpgrades) ? data.detectedUpgrades : [],
    confidenceScores: data.confidenceScores ?? {},
    extractedAt: new Date(),
  }

  await upsertBuildingProfile(profile)
  await updatePermit(permitId, { status: 'analyzed' })

  return { outcome: 'completed' }
}
