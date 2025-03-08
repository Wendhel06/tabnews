import { InternalServerError, MethodNotAllowedError } from "./errors.js";

function onNoMatchHandler(request, response) {
  const publicResponseMigrations = new MethodNotAllowedError();
  response
    .status(publicResponseMigrations.statusCode)
    .json(publicResponseMigrations);
}

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });

  console.error(publicErrorObject);

  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorsHandler: {
    onError: onErrorHandler,
    onNoMatch: onNoMatchHandler,
  },
};

export default controller;
