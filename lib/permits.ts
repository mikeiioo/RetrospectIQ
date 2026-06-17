import { ObjectId, type Collection } from "mongodb";
import { getDb } from "./mongodb";

export type PermitStatus =
  | "uploaded"
  | "text_extracted"
  | "scanned_pdf"
  | "analyzed"
  | "scored";

export interface TextExtraction {
  status: "completed" | "failed" | "scanned_pdf";
  characterCount: number;
  extractedAt: Date;
  error?: string;
}

export interface Permit {
  _id?: ObjectId;
  buildingName: string;
  address: string;
  s3Key: string;
  originalFilename: string;
  sizeBytes: number;
  contentType: string;
  uploadedAt: Date;
  status: PermitStatus;
  rawText?: string;
  textExtraction?: TextExtraction;
}

export interface PermitView {
  id: string;
  buildingName: string;
  address: string;
  s3Key: string;
  originalFilename: string;
  sizeBytes: number;
  contentType: string;
  uploadedAt: string;
  status: PermitStatus;
  rawText?: string;
  textExtraction?: {
    status: "completed" | "failed" | "scanned_pdf";
    characterCount: number;
    extractedAt: string;
    error?: string;
  };
}

function toView(p: Permit & { _id: ObjectId }): PermitView {
  return {
    id: p._id.toString(),
    buildingName: p.buildingName,
    address: p.address,
    s3Key: p.s3Key,
    originalFilename: p.originalFilename,
    sizeBytes: p.sizeBytes,
    contentType: p.contentType,
    uploadedAt: p.uploadedAt.toISOString(),
    status: p.status,
    rawText: p.rawText,
    textExtraction: p.textExtraction
      ? {
          status: p.textExtraction.status,
          characterCount: p.textExtraction.characterCount,
          extractedAt: p.textExtraction.extractedAt.toISOString(),
          error: p.textExtraction.error,
        }
      : undefined,
  };
}

async function permitsCollection(): Promise<Collection<Permit>> {
  const db = await getDb();
  return db.collection<Permit>("permits");
}

export async function createPermit(input: {
  buildingName: string;
  address: string;
  s3Key: string;
  originalFilename: string;
  sizeBytes: number;
  contentType: string;
}): Promise<string> {
  const col = await permitsCollection();
  const result = await col.insertOne({
    ...input,
    uploadedAt: new Date(),
    status: "uploaded",
  });
  return result.insertedId.toString();
}

export async function getPermit(id: string): Promise<PermitView | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await permitsCollection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return doc ? toView(doc) : null;
}

export async function listPermits(): Promise<PermitView[]> {
  const col = await permitsCollection();
  const docs = await col.find().sort({ uploadedAt: -1 }).toArray();
  return docs.map(toView);
}

export async function updatePermit(
  id: string,
  fields: Partial<Pick<Permit, "status" | "rawText" | "textExtraction">>
): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error(`Invalid permit id: ${id}`);
  const col = await permitsCollection();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: fields });
}
