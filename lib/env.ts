function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const mongoUri = (): string => requireEnv("MONGODB_URI");
export const awsRegion = (): string => requireEnv("AWS_REGION");
export const awsAccessKeyId = (): string => requireEnv("AWS_ACCESS_KEY_ID");
export const awsSecretAccessKey = (): string => requireEnv("AWS_SECRET_ACCESS_KEY");
export const s3Bucket = (): string => requireEnv("AWS_S3_BUCKET_NAME");
export const openaiApiKey = (): string => requireEnv("OPENAI_API_KEY");
