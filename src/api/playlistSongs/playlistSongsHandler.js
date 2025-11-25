const ClientError = require("../../exceptions/ClientError");

const autoBind = require("auto-bind").default;

class PlaylistSongsHandler {
  constructor(service, validator, playlistsService, collaborationsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;
    this._collaborationsService = collaborationsService;

    autoBind(this);
  }

  // get songs in playlist
  async getSongInPlaylistHandler(request) {
    // get playlist id
    const { id: playlistId } = request.params;

    // get credential id
    const { id: credentialId } = request.auth.credentials;

    // verify owner or collaborator
    try {
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );
    } catch (error) {
      if (error instanceof ClientError) {
        if (error.statusCode === 404) {
          throw error; // playlist not found
        }
        // not owner -> verify collaborator
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          credentialId
        );
      } else {
        throw error;
      }
    }

    const playlist = await this._service.getSongInPlaylist(playlistId);

    return {
      status: "success",
      data: {
        playlist,
      },
    };
  }

  //   post song to playlist
  async postSongToPlaylistHandler(request, h) {
    try {
      // validate

      this._validator.validatePlaylistSongPayload(request.payload);

      // get user payload
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      // verify owner or collaborator
      try {
        await this._playlistsService.verifyPlaylistOwner(
          playlistId,
          credentialId
        );
      } catch (error) {
        if (error instanceof ClientError) {
          if (error.statusCode === 404) {
            throw error; // playlist not found
          }
          await this._collaborationsService.verifyCollaborator(
            playlistId,
            credentialId
          );
        } else {
          throw error;
        }
      }

      // add songs to playlist and record activity
      await this._service.addSongToPlaylist(playlistId, songId, credentialId);

      const response = h.response({
        status: "success",
        message: "Lagu berhasil ditambahkan ke playlist",
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

  //   delete song in playlist
  async deleteSongInPlaylistHandler(request, h) {
    try {
      // validate
      this._validator.validatePlaylistSongPayload(request.payload);

      //   get user payload
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      //   verify owner or collaborator
      try {
        await this._playlistsService.verifyPlaylistOwner(
          playlistId,
          credentialId
        );
      } catch (error) {
        if (error instanceof ClientError) {
          if (error.statusCode === 404) {
            throw error; // playlist not found
          }
          await this._collaborationsService.verifyCollaborator(
            playlistId,
            credentialId
          );
        } else {
          throw error;
        }
      }

      //   delete song from playlist and record activity
      await this._service.deleteSongInPlaylist(
        playlistId,
        songId,
        credentialId
      );

      return {
        status: "success",
        message: "Lagu berhasil dihapus dari playlist",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      //   SERVER ERROR
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

module.exports = PlaylistSongsHandler;
