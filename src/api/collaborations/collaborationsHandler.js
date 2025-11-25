const ClientError = require("../../exceptions/ClientError");

const autoBind = require("auto-bind").default;

class CollaborationsHandler {
  constructor(service, playlistService, validator) {
    this._service = service;
    this._playlistService = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      // validate payload
      this._validator.validateCollaborationPayload(request.payload);

      //   get auth credentials
      const { id: credentialId } = request.auth.credentials;

      //   get value payload
      const { playlistId, userId } = request.payload;

      // verify owner
      await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

      const collaborationId = await this._service.addCollaboration(
        playlistId,
        userId
      );

      const response = h.response({
        status: "success",
        message: "Kolaborasi berhasil ditambahkan",
        data: {
          collaborationId,
        },
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

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  //   delete collaboration

  async deleteCollaborationHandler(request) {
    // validate user payload
    this._validator.validateCollaborationPayload(request.payload);

    // get credential id
    const { id: credentialId } = request.auth.credentials;
    // get user payload
    const { playlistId, userId } = request.payload;

    // verify owner
    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

    // delete collaboration
    await this._service.deleteCollaboration(playlistId, userId);

    return {
      status: "success",
      message: "Kolaborasi berhasil dihapus",
    };
  }
}

module.exports = CollaborationsHandler;
