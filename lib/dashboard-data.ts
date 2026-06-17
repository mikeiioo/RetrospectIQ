import {
  getBuildingProfile,
  type BuildingProfile,
} from "@/lib/building-profiles";
import { getPermit, listPermits, type PermitView } from "@/lib/permits";
import { getPrediction, type Prediction } from "@/lib/predictions";

export interface BuildingRecord {
  permit: PermitView;
  profile: BuildingProfile | null;
  prediction: Prediction | null;
}

export interface RecommendationRecord {
  permit: PermitView;
  profile: BuildingProfile | null;
  prediction: Prediction;
  recommendation: Prediction["recommendations"][number];
}

export async function listBuildingRecords(): Promise<BuildingRecord[]> {
  const permits = await listPermits();
  return Promise.all(
    permits.map(async (permit) => ({
      permit,
      profile: await getBuildingProfile(permit.id),
      prediction: await getPrediction(permit.id),
    })),
  );
}

export async function getBuildingRecord(id: string): Promise<BuildingRecord | null> {
  const permit = await getPermit(id);
  if (!permit) return null;

  const [profile, prediction] = await Promise.all([
    getBuildingProfile(id),
    getPrediction(id),
  ]);

  return { permit, profile, prediction };
}

export function listRecommendationRecords(
  records: BuildingRecord[],
): RecommendationRecord[] {
  return records.flatMap((record) => {
    if (!record.prediction) return [];

    return record.prediction.recommendations.map((recommendation) => ({
      permit: record.permit,
      profile: record.profile,
      prediction: record.prediction as Prediction,
      recommendation,
    }));
  });
}

export function readinessScore(record: BuildingRecord): number | null {
  return record.prediction?.retrofitImpactScore ?? null;
}
