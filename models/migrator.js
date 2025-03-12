import { getNewClient } from "infra/database.js";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";

const defaultOptionsMigrations = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

let dbClient;

async function listPendingMigrations() {
  try {
    dbClient = await getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultOptionsMigrations,
      dbClient,
    });
    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  try {
    dbClient = await getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultOptionsMigrations,
      dbClient,
      dryRun: false,
    });
    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
