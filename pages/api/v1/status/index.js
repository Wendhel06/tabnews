import database from "../../../../infra/database.js";

async function status(request, response) {
  const result = await database.query("SELECT 10 + 1 as sum;");
  console.log(result.rows);
  response.status(200).json({ chave: "Está tudo funcionando agora" });
}

export default status;
