// plugin albums

const AlbumsHandler = require("./albumsHandler");
const routes = require("./routes");

module.exports = {
  name: "albums",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const albumsHandler = new AlbumsHandler(service, validator);
    server.route(routes(albumsHandler));
  },
};
