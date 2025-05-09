import retry from "async-retry";
import { faker, Faker } from "@faker-js/faker/.";

import { query } from "infra/database.js";
import migrator from "models/migrator";
import { create } from "models/user";

export async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

export async function clearDatabase() {
  return await query("drop schema public  cascade; create schema public;");
}

export async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

export async function createUser(userObject) {
  return await create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]g/, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "senhaDeSegurança",
  });
}
