const autoBind = require("auto-bind").default;

class PlaylistSongActivitiesHandler {
  constructor(service, playlistsService) {
    this._service = service;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async getActivitiesHandler(request, h) {
    // get playlist id from params
    const { id: playlistId } = request.params;

    // get credential id
    const { id: credentialId } = request.auth.credentials;

    // verify owner
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const activities = await this._service.getActivitiesInPlaylist(playlistId);

    return h.response({
      status: "success",
      data: {
        playlistId,
        activities,
      },
    });
  }
}

module.exports = PlaylistSongActivitiesHandler;
