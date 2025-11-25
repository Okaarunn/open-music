const ClientError = require("../../exceptions/ClientError");

const autoBind = require("auto-bind").default;

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  //   get playlist
  async getPlaylistHandler(request) {
    // get id owner
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylist(credentialId);
    return {
      status: "success",
      data: {
        playlists,
      },
    };
  }

  // post playlist
  async postPlaylistHandler(request, h) {
    try {
      // validate user payload
      this._validator.validatePlaylistsPayload(request.payload);

      // get user payload
      const { name = "untitled" } = request.payload;

      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({
        name,
        owner: credentialId,
      });

      const response = h.response({
        status: "success",
        data: {
          playlistId,
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

  // delete playlist
  async deletePlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      // verify owner
      await this._service.verifyPlaylistOwner(id, credentialId);

      await this._service.deletePlaylistById(id);

      const response = h.response({
        status: "success",
        message: "Playlist berhasil dihapus",
      });

      response.code(200);
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

module.exports = PlaylistsHandler;
