import { version as uuidVersion } from "uuid";

import {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
} from "tests/orchestrator.js";
import { findOneByUsername } from "models/user";
import { compare } from "bcryptjs";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
  await runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/cachorrinho",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Username não encontrado.",
        action: "Verifique se digitou o nome do username corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated  'username'", async () => {
      const user1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@gmail.com",
          password: 92142867,
        }),
      });

      expect(user1.status).toBe(201);

      const user2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@gmail.com",
          password: 92142867,
        }),
      });

      expect(user2.status).toBe(201);

      const updatedUser = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user1",
          }),
        },
      );

      expect(updatedUser.status).toBe(400);

      const responseBody = await updatedUser.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated  'email'", async () => {
      const email1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@gmail.com",
          password: 92142867,
        }),
      });

      expect(email1.status).toBe(201);

      const email2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@gmail.com",
          password: 92142867,
        }),
      });

      expect(email2.status).toBe(201);

      const updatedUserEmail = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@gmail.com",
          }),
        },
      );

      expect(updatedUserEmail.status).toBe(400);

      const responseBody = await updatedUserEmail.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "wendhel230",
          email: "wendhel230@gmail.com",
          password: 92142867,
        }),
      });

      expect(user1Response.status).toBe(201);

      const updatedUser1 = await fetch(
        "http://localhost:3000/api/v1/users/wendhel230",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: "wendhel220" }),
        },
      );

      expect(updatedUser1.status).toBe(200);

      const updatedUser1ResponseBody = await updatedUser1.json();

      expect(updatedUser1ResponseBody).toEqual({
        id: updatedUser1ResponseBody.id,
        username: "wendhel220",
        email: "wendhel230@gmail.com",
        password: updatedUser1ResponseBody.password,
        created_at: updatedUser1ResponseBody.created_at,
        updated_at: updatedUser1ResponseBody.updated_at,
      });

      expect(uuidVersion(updatedUser1ResponseBody.id)).toBe(4);
      expect(Date.parse(updatedUser1ResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(updatedUser1ResponseBody.updated_at)).not.toBeNaN();

      expect(
        updatedUser1ResponseBody.updated_at >
          updatedUser1ResponseBody.created_at,
      ).toBe(true);
    });

    test("With unique 'email'", async () => {
      const newEmail = await fetch(
        "http://localhost:3000/api/v1/users/wendhel220",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "wendhel280@gmail.com",
          }),
        },
      );
      expect(newEmail.status).toBe(200);

      const responseBody = await newEmail.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "wendhel220",
        email: "wendhel280@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const newPassword = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "92142867892356",
          }),
        },
      );

      expect(newPassword.status).toBe(200);

      const responseBodyNewPassword = await newPassword.json();

      expect(responseBodyNewPassword).toEqual({
        id: responseBodyNewPassword.id,
        username: "email2",
        email: "email2@gmail.com",
        password: responseBodyNewPassword.password,
        created_at: responseBodyNewPassword.created_at,
        updated_at: responseBodyNewPassword.updated_at,
      });

      expect(
        responseBodyNewPassword.updated_at > responseBodyNewPassword.created_at,
      ).toBe(true);

      const userInDataBase = await findOneByUsername("email2");
      const correctPasswordMatch = await compare(
        "92142867892356",
        userInDataBase.password,
      );
      const incorrectPasswordMatch = await compare(
        "92142867",
        userInDataBase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
