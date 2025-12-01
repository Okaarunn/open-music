const ClientError = require("../../exceptions/ClientError");
const InvariantError = require("../../exceptions/InvariantError");

const autoBind = require("auto-bind").default;

class UploadsHandler {
  constructor(service, validator, albumsService) {
    this._service = service;
    this._validator = validator;
    this.albumsService = albumsService;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    try {
      const { cover } = request.payload;
      if (!cover || !cover.hapi) {
        throw new InvariantError(
          "Payload file tidak ditemukan. Pastikan form-data field 'cover' berisi file."
        );
      }

      const { id: albumId } = request.params;

      //   get albums id from albums service
      await this.albumsService.getAlbumById(albumId);

      //   validate data
      this._validator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._service.writeFile(cover, cover.hapi);

      // persist cover filename into album
      await this.albumsService.editAlbumCover(albumId, filename);

      const response = h.response({
        status: "success",
        message: "File berhasil diunggah",
        data: {
          fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`,
        },
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

module.exports = UploadsHandler;
