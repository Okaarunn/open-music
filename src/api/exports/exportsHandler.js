const ClientError = require("../../exceptions/ClientError");
const autoBind = require("auto-bind").default;

class ExportsHandler {
  constructor(service, validator, playlistsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._validator.validateExportPlaylistPayload({
        playlistId,
        targetEmail: request.payload.targetEmail,
      });

      // verify owner
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      const message = {
        playlistId,
        credentialId,
        targetEmail: request.payload.targetEmail,
      };

      await this._service.sendMessage(
        "export:playlists",
        JSON.stringify(message)
      );

      const response = h.response({
        status: "success",
        message: "Permintaan Anda sedang kami proses",
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ExportsHandler;
