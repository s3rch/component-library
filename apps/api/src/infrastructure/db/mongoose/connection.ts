import mongoose from "mongoose";

export async function connectMongo(uri: string): Promise<void> {
  await mongoose.connect(uri);
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}

export async function clearMongoDatabase(): Promise<void> {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((c) => c.deleteMany({})));
}


