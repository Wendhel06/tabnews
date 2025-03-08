import { createRouter } from "next-connect";
import { query } from "infra/database.js";
import controller from "infra/controller.js";

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorsHandler);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConectionsResult = await query("SHOW max_connections;");
  const databaseMaxConectionsValue =
    databaseMaxConectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: Number(databaseMaxConectionsValue),
        opened_connections: databaseOpenedConnectionsValue,
      },
    },
  });
}
