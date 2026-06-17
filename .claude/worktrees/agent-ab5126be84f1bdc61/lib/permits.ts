import { ObjectId, type Collection } from "mongodb";
import { getDb } from "./mongodb";

export type PermitStatus = "uploaded";

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
