import { type Collection } from "mongodb";
import { getDb } from "./mongodb";

export interface DetectedUpgrade {
  type: "HVAC" | "Lighting" | "Electrical" | "Envelope" | "Controls" | "Other";
  description: string;
  year: number | null;
}

export interface BuildingProfile {
  permitId: string;
  buildingYear: number | null;
  buildingType: string | null;
  squareFootage: number | null;
  hvacSystem: string | null;
  lightingType: string | null;
  electricalService: string | null;
  detectedUpgrades: DetectedUpgrade[];
  confidenceScores: Record<string, number>;
  extractedAt: Date;
}

async function col(): Promise<Collection<BuildingProfile>> {
  const db = await getDb();
  return db.collection<BuildingProfile>("building_profiles");
}

export async function upsertBuildingProfile(profile: BuildingProfile): Promise<void> {
  const c = await col();
  await c.replaceOne({ permitId: profile.permitId }, profile, { upsert: true });
}

export async function getBuildingProfile(permitId: string): Promise<BuildingProfile | null> {
  const c = await col();
  return c.findOne({ permitId });
}

export async function listBuildingProfiles(permitIds: string[]): Promise<BuildingProfile[]> {
  if (permitIds.length === 0) return [];
  const c = await col();
  return c.find({ permitId: { $in: permitIds } }).toArray();
}
