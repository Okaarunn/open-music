const routes = require("./routes");
const PlaylistSongsHandler = require("./playlistSongsHandler");

module.exports = {
  name: "playlistSongs",
  version: "1.0.0",

  register: async (
    server,
    { service, validator, playlistsService, collaborationsService }
  ) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      service,
      validator,
      playlistsService,
      collaborationsService
    );
    server.route(routes(playlistSongsHandler));
  },
};
