import {
  getBuildingProfile,
  listBuildingProfiles,
  type BuildingProfile,
} from "@/lib/building-profiles";
import { getPermit, listPermits, type PermitView } from "@/lib/permits";
import { getPrediction, listPredictions, type Prediction } from "@/lib/predictions";

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

export async function listBuildingRecords(ownerId: string): Promise<BuildingRecord[]> {
  const permits = await listPermits(ownerId);
  const permitIds = permits.map((permit) => permit.id);
  const [profiles, predictions] = await Promise.all([
    listBuildingProfiles(permitIds),
    listPredictions(permitIds),
  ]);
  const profileById = new Map(profiles.map((profile) => [profile.permitId, profile]));
  const predictionById = new Map(
    predictions.map((prediction) => [prediction.permitId, prediction]),
  );

  return permits.map((permit) => ({
    permit,
    profile: profileById.get(permit.id) ?? null,
    prediction: predictionById.get(permit.id) ?? null,
  }));
}

export async function getBuildingRecord(
  id: string,
  ownerId: string,
): Promise<BuildingRecord | null> {
  const permit = await getPermit(id, ownerId);
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
