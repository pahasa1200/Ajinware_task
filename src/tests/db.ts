import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
let mongoServer: MongoMemoryServer;

const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export const connectMongo = async () => {
  await mongoose.disconnect();

  mongoServer = await MongoMemoryServer.create();

  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri)
};

export const closeMongo = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const clearMongo = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
};
