import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { closeEmailQueue } from "../queues/emailQueue.js";

jest.setTimeout(180000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });

  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections || {});

  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await closeEmailQueue();
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
});
