const routes = require("./routes");
const PlaylistSongActivitiesHandler = require("./playlistSongActivitiesHandler");

module.exports = {
  name: "playlistSongActivities",
  version: "1.0.0",

  register: async (server, { service, playlistsService }) => {
    const handler = new PlaylistSongActivitiesHandler(service, playlistsService);
    server.route(routes(handler));
  },
};
