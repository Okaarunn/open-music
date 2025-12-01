const Joi = require("joi");

const UserAlbumLikesPayloadSchema = Joi.object({
  albumId: Joi.string().required(),
});

module.exports = { UserAlbumLikesPayloadSchema };
