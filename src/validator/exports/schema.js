const Joi = require("joi");

const ExportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
  playlistId: Joi.string().required(),
});

module.exports = ExportPlaylistPayloadSchema;
