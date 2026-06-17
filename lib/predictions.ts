import { type Collection } from "mongodb";
import { getDb } from "./mongodb";

export interface Recommendation {
  name: string;
  category: "Lighting" | "HVAC" | "Controls" | "Automation" | "Audit";
  priority: "Low" | "Medium" | "High";
  reason: string;
}

export interface Prediction {
  permitId: string;
  retrofitImpactScore: number;
  priority: "Low" | "Moderate" | "High" | "Critical";
  estimatedEnergyReductionPercent: number;
  estimatedAnnualSavings: number;
  estimatedCarbonReductionTons: number;
  recommendations: Recommendation[];
  modelType: "prototype_rule_based";
  generatedAt: Date;
}

async function col(): Promise<Collection<Prediction>> {
  const db = await getDb();
  return db.collection<Prediction>("predictions");
}

export async function upsertPrediction(prediction: Prediction): Promise<void> {
  const c = await col();
  await c.replaceOne({ permitId: prediction.permitId }, prediction, { upsert: true });
}

export async function getPrediction(permitId: string): Promise<Prediction | null> {
  const c = await col();
  return c.findOne({ permitId });
}
