import { S3Client } from "@aws-sdk/client-s3";
import { awsAccessKeyId, awsRegion, awsSecretAccessKey, s3Bucket } from "./env";

declare global {
  var __retroS3: S3Client | undefined;
}

export function getS3Client(): S3Client {
  if (!globalThis.__retroS3) {
    globalThis.__retroS3 = new S3Client({
      region: awsRegion(),
      credentials: {
        accessKeyId: awsAccessKeyId(),
        secretAccessKey: awsSecretAccessKey(),
      },
    });
  }
  return globalThis.__retroS3;
}

export const getS3Bucket = (): string => s3Bucket();
