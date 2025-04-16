import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import { findOneByUsername } from "models/user.js";

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorsHandler);

async function getHandler(request, response) {
  const username = await request.query.username;
  const userFound = await findOneByUsername(username);
  return response.status(200).json(userFound);
}
