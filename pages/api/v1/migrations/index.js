import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import { getNewClient } from "infra/database.js";
import { createRouter } from "next-connect";
import controller from "infra/controller.js";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorsHandler);

let dbClient;

const defaultOptionsMigrations = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  try {
    dbClient = await getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultOptionsMigrations,
      dbClient,
    });
    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
  try {
    dbClient = await getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultOptionsMigrations,
      dbClient,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  } finally {
    await dbClient.end();
  }
}
