const routes = (handler) => [
  {
    method: "GET",
    path: "/playlists/{id}/songs",
    handler: handler.getSongInPlaylistHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },

  {
    method: "POST",
    path: "/playlists/{id}/songs",
    handler: handler.postSongToPlaylistHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },

  {
    method: "DELETE",
    path: "/playlists/{id}/songs",
    handler: handler.deleteSongInPlaylistHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
];

module.exports = routes;
