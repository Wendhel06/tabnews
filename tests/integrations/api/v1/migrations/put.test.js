import { clearDatabase, waitForAllServices } from "tests/orchestrator.js";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
});

describe("PUT /api/v1/migrations", () => {
  describe("anonymous user", () => {
    describe("Running pending migrations", () => {
      test("methods not allowed", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "PUT",
          },
        );
        expect(response.status).toBe(405);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
          name: "MethodNotAllowedError",
          message: "Método não permitido para este endpoint.",
          action:
            "Verifique se o método HTTP enviado é válido para este endpoint.",
          status_code: 405,
        });
      });
    });
  });
});
