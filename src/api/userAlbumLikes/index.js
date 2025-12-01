const UserAlbumLikesHandler = require("./userAlbumLikesHandler");
const routes = require("./routes");

module.exports = {
  name: "userAlbumLikes",
  version: "1.0.0",
  register: async (server, { service, albumsService, validator, cacheService }) => {
    const handler = new UserAlbumLikesHandler(
      service,
      validator,
      albumsService,
      cacheService
    );
    server.route(routes(handler));
  },
};
