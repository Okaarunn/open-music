const autoBind = require("auto-bind").default;

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  //   get songs (supports optional search by title via ?title=...)
  async getSongsHandler(request) {
    const { title, performer } = request.query || {};
    const songs = await this._service.getSongs(title, performer);
    return {
      status: "success",
      data: {
        songs,
      },
    };
  }

  //   get song by id
  async getSongByIdHandler(request) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);
    return {
      status: "success",
      data: {
        song,
      },
    };
  }

  //   post song
  async postSongHandler(request, h) {
    this._validator.validateSongsPayload(request.payload);
    const { title, year, performer, genre, duration, albumId } =
      request.payload;
    const songId = await this._service.addSong({
      title,
      year,
      performer,
      genre,
      duration,
      albumId,
    });

    const response = h.response({
      status: "success",
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }

  //   edit songs
  async putSongByIdHandler(request) {
    this._validator.validateSongsPayload(request.payload);

    const { id } = request.params;
    await this._service.editSongById(id, request.payload);

    return {
      status: "success",
      message: "Lagu berhasil diperbarui",
    };
  }

  //   delete song
  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: "success",
      message: "Lagu berhasil dihapus",
    };
  }
}

module.exports = SongsHandler;
