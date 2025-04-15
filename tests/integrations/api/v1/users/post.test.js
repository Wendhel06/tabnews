import { version as uuidVersion } from "uuid";

import {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
} from "tests/orchestrator.js";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
  await runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "wendhel07",
          email: "wendhelalves7@gmail.com",
          password: 92142867,
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "wendhel07",
        email: "wendhelalves7@gmail.com",
        password: "92142867",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With duplicated 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //Como se fosse um formulário enviado por um usuário no front end.
        body: JSON.stringify({
          username: "usuario1",
          email: "duplicado@gmail.com",
          password: "92142867",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //Como se fosse um formulário enviado por um usuário no front end.
        body: JSON.stringify({
          username: "usuario1",
          email: "Duplicado@gmail.com",
          password: "92142867",
        }),
      });

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usuarioduplicado",
          email: "duplicado@gmail22.com",
          password: "92142867",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "UsuarioDuplicado",
          email: "duplicado@gmail13.com",
          password: "92142867",
        }),
      });

      expect(response2.status).toBe(400);

      const response3Body = await response2.json();

      expect(response3Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastro.",
        status_code: 400,
      });
    });
  });
});
