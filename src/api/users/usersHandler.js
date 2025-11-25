const autoBind = require("auto-bind").default;

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  // post user handler
  async postUserHandler(request, h) {
    // validate user payload
    this._validator.validateUserPayload(request.payload);

    // get value user payload
    const { username, password, fullname } = request.payload;

    const userId = await this._service.addUser({
      username,
      password,
      fullname,
    });
    const response = h.response({
      status: "success",
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
