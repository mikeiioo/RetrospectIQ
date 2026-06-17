import { MongoClient, type Db } from "mongodb";
import { mongoUri } from "./env";

declare global {
  var __retroMongo: { client: MongoClient; promise: Promise<MongoClient> } | undefined;
}

function getCached() {
  if (!globalThis.__retroMongo) {
    const client = new MongoClient(mongoUri());
    globalThis.__retroMongo = { client, promise: client.connect() };
  }
  return globalThis.__retroMongo;
}

export async function getMongoClient(): Promise<MongoClient> {
  return getCached().promise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db();
}
