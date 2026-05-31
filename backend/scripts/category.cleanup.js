import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { cleanupCatalog } from "./catalog.cleanup.js";

const run = async () => {
  const dryRun = process.argv.includes("--dry-run");

  await connectDB();
  const result = await cleanupCatalog({ dryRun });
  console.log(JSON.stringify(result, null, 2));
  await mongoose.disconnect();
};

const __filename = fileURLToPath(import.meta.url);
const isCli = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isCli) {
  run().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  });
}
