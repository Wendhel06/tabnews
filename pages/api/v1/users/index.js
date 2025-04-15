import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import { create } from "models/user.js";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorsHandler);

async function postHandler(request, response) {
  const userInputValues = await request.body;
  const newUser = await create(userInputValues);

  return response.status(201).json(newUser);
}
