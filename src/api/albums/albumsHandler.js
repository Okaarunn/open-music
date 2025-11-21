const autoBind = require("auto-bind").default;

class AlbumsHandler {
  constructor(service, validator, songsService) {
    this._service = service;
    this._validator = validator;
    this._songsService = songsService;
    autoBind(this);
  }

  // get albums
  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: "success",
      data: {
        albums,
      },
    };
  }

  //   get album by id
  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    // fetch songs for this album from SongsService (if provided)
    let songs = [];
    if (this._songsService && typeof this._songsService.getSongsByAlbumId === 'function') {
      songs = await this._songsService.getSongsByAlbumId(id);
    }

    // attach songs array to album detail
    album.songs = songs;

    return {
      status: "success",
      data: {
        album,
      },
    };
  }

  // post albums service
  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: "success",
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);

    return {
      status: "success",
      message: "Album berhasil diperbarui",
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: "success",
      message: "Album berhasil dihapus",
    };
  }
}

module.exports = AlbumsHandler;
