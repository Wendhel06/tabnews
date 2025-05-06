import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import { findOneByUsername, update } from "models/user.js";

const router = createRouter();
router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorsHandler);

async function getHandler(request, response) {
  const username = await request.query.username;
  const userFound = await findOneByUsername(username);
  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const username = await request.query.username;
  const userInputValues = await request.body;

  const updatedUser = await update(username, userInputValues);

  return response.status(200).json(updatedUser);
}
