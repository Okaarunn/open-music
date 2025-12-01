const ClientError = require("../../exceptions/ClientError");
const autoBind = require("auto-bind").default;

class UserAlbumLikesHandler {
  constructor(service, validator, albumsService, cacheService) {
    this._service = service;
    this._validator = validator;
    this._albumsService = albumsService;
    this._cacheService = cacheService;
    autoBind(this);
  }

  async postAlbumLikeHandler(request, h) {
    try {
      // get album id and user id
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      //   get album id
      await this._albumsService.getAlbumById(albumId);
      //   post like album
      await this._service.addLikeAlbum(userId, albumId);
      // invalidate cache for this album likes
      try {
        await this._cacheService.delete(`album_likes:${albumId}`);
      } catch (e) {
        // cache may not exist; ignore
      }

      const response = h.response({
        status: "success",
        message: "Album disukai",
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({ status: "fail", message: error.message });
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

  async deleteAlbumLikeHandler(request, h) {
    try {
      // get album id and user id
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      //   get album id
      await this._albumsService.getAlbumById(albumId);
      //   remove like album
      await this._service.removeLikeAlbum(userId, albumId);
      // invalidate cache for this album likes
      try {
        await this._cacheService.delete(`album_likes:${albumId}`);
      } catch (e) {
        // ignore cache delete error
      }

      return { status: "success", message: "Like berhasil dihapus" };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({ status: "fail", message: error.message });
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

  async getAlbumLikesHandler(request, h) {
    try {
      // get album id
      const { id: albumId } = request.params;
      await this._albumsService.getAlbumById(albumId);

      // try get from cache first
      try {
        const cached = await this._cacheService.get(`album_likes:${albumId}`);
        const likes = parseInt(cached, 10);
        const response = h.response({ status: "success", data: { likes } });
        response.header("X-Data-Source", "cache");
        return response;
      } catch (error) {
        // cache miss: continue to fetch from DB
      }

      const likes = await this._service.countLikes(albumId);
      try {
        await this._cacheService.set(`album_likes:${albumId}`, likes.toString(), 1800);
      } catch (error) {
        // cache set failure shouldn't block response
      }
      return { status: "success", data: { likes } };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({ status: "fail", message: error.message });
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

module.exports = UserAlbumLikesHandler;
