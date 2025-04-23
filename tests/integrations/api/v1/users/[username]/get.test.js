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

describe("GET /api/v1/users/[username]", () => {
  describe("anonymous user", () => {
    test("With exact case match", async () => {
      const responseCaseMatch = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "MesmoCase",
            email: "mesmocase7@gmail.com",
            password: 92142867,
          }),
        },
      );

      expect(responseCaseMatch.status).toBe(201);

      const responseCaseMatch2 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );

      expect(responseCaseMatch2.status).toBe(200);

      const responseBodyCaseMatch = await responseCaseMatch2.json();

      expect(responseBodyCaseMatch).toEqual({
        id: responseBodyCaseMatch.id,
        username: "MesmoCase",
        email: "mesmocase7@gmail.com",
        password: responseBodyCaseMatch.password,
        created_at: responseBodyCaseMatch.created_at,
        updated_at: responseBodyCaseMatch.updated_at,
      });

      expect(uuidVersion(responseBodyCaseMatch.id)).toBe(4);
      expect(Date.parse(responseBodyCaseMatch.created_at)).not.toBeNaN();
      expect(Date.parse(responseBodyCaseMatch.updated_at)).not.toBeNaN();
    });

    test("With case missmatch", async () => {
      const responseCaseMissMatch = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "CaseDiferente",
            email: "case.diferente@gmail.com",
            password: 92142867,
          }),
        },
      );

      expect(responseCaseMissMatch.status).toBe(201);

      const responseCaseMissMatch2 = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );

      expect(responseCaseMissMatch2.status).toBe(200);

      const responseBodyCaseMissMatch = await responseCaseMissMatch2.json();

      expect(responseBodyCaseMissMatch).toEqual({
        id: responseBodyCaseMissMatch.id,
        username: "CaseDiferente",
        email: "case.diferente@gmail.com",
        password: responseBodyCaseMissMatch.password,
        created_at: responseBodyCaseMissMatch.created_at,
        updated_at: responseBodyCaseMissMatch.updated_at,
      });

      expect(uuidVersion(responseBodyCaseMissMatch.id)).toBe(4);
      expect(Date.parse(responseBodyCaseMissMatch.created_at)).not.toBeNaN();
      expect(Date.parse(responseBodyCaseMissMatch.updated_at)).not.toBeNaN();
    });

    test("With nonexistent user", async () => {
      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistent",
      );

      expect(response3.status).toBe(404);

      const responseBodyNoneExistent = await response3.json();

      expect(responseBodyNoneExistent).toEqual({
        name: "NotFoundError",
        message: "Username não encontrado.",
        action: "Verifique se digitou o nome do username corretamente.",
        status_code: 404,
      });
    });
  });
});
