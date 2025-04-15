import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
} from "./errors.js";

function onNoMatchHandler(request, response) {
  const publicResponseMigrations = new MethodNotAllowedError();
  response
    .status(publicResponseMigrations.statusCode)
    .json(publicResponseMigrations);
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error);
  }

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
