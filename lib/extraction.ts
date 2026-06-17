import { PDFParse } from 'pdf-parse'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getS3Client, getS3Bucket } from './s3'
import { getPermit, updatePermit } from './permits'

export type ExtractionResult = {
  outcome: 'completed' | 'scanned_pdf' | 'failed'
  error?: string
}

const MIN_CHARS = 100
const MAX_CHARS = 100_000

async function downloadPdf(s3Key: string): Promise<Buffer> {
  const cmd = new GetObjectCommand({ Bucket: getS3Bucket(), Key: s3Key })
  const res = await getS3Client().send(cmd)
  const stream = res.Body as AsyncIterable<Uint8Array>
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export async function extractPermitText(permitId: string): Promise<ExtractionResult> {
  const permit = await getPermit(permitId)
  if (!permit) throw new Error(`Permit not found: ${permitId}`)

  const buffer = await downloadPdf(permit.s3Key)
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText()
  const rawText = result.text.slice(0, MAX_CHARS)
  const characterCount = rawText.replace(/\s/g, '').length

  if (characterCount < MIN_CHARS) {
    await updatePermit(permitId, {
      status: 'scanned_pdf',
      rawText: '',
      textExtraction: { status: 'scanned_pdf', characterCount: 0, extractedAt: new Date() },
    })
    return { outcome: 'scanned_pdf' }
  }

  await updatePermit(permitId, {
    status: 'text_extracted',
    rawText,
    textExtraction: { status: 'completed', characterCount, extractedAt: new Date() },
  })
  return { outcome: 'completed' }
}
