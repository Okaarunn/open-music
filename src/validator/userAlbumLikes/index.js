const InvariantError = require("../../exceptions/InvariantError");
const { UserAlbumLikesPayloadSchema } = require("./schema");

const userAlbumLikesValidator = {
  validateUserAlbumLikesPayload: (payload) => {
    const validationResult = UserAlbumLikesPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = userAlbumLikesValidator;
