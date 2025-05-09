import { query } from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";
import { hash } from "models/password.js";

export async function create(userInputValues) {
  await validateUniqUsername(userInputValues.username);
  await validateUniqEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  async function runInsertQuery(userInputValues) {
    const results = await query({
      text: `
        INSERT INTO 
          users (username, email, password)
        VALUES
          ($1,$2,$3)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }

  const newUser = await runInsertQuery(userInputValues);
  return newUser;
}

export async function findOneByUsername(username) {
  const userFound = await selectRunQuery(username);
  return userFound;

  async function selectRunQuery(username) {
    const results = await query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1    
      ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Username não encontrado.",
        action: "Verifique se digitou o nome do username corretamente.",
      });
    }
    return results.rows[0];
  }
}

export async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };
  const updatedUser = await runUpdateUser(userWithNewValues);

  return updatedUser;
}

async function validateUniqUsername(username) {
  const results = await query({
    text: `
    SELECT
      username
    FROM
      users
    WHERE
      LOWER(username) = LOWER($1)
    ;`,
    values: [username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

async function validateUniqEmail(email) {
  const results = await query({
    text: `
      SELECT
        email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
    ;`,
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

async function runUpdateUser(userWithNewValues) {
  const results = await query({
    text: `
    UPDATE
      users
    SET
      username = $2,
      email = $3,
      password = $4,
      updated_at = timezone('utc', now())
    WHERE
      id = $1
    RETURNING
      *
    `,
    values: [
      userWithNewValues.id,
      userWithNewValues.username,
      userWithNewValues.email,
      userWithNewValues.password,
    ],
  });

  return results.rows[0];
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await hash(userInputValues.password);
  return (userInputValues.password = hashedPassword);
}
