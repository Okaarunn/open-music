const { nanoid } = require("nanoid");
const { Pool } = require("pg");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  //   get albums
  async getAlbums() {
    const query = "SELECT * FROM albums";
    const result = await this._pool.query(query);

    return result.rows;
  }

  //   get albums by id
  async getAlbumById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    const album = result.rows[0];

    // get songs for this album
    let songsResult;

    try {
      const songsQuery = {
        text: "SELECT id, title, performer FROM songs WHERE album_id = $1",
        values: [id],
      };
      songsResult = await this._pool.query(songsQuery);
    } catch {
      // if songsQuery fail return album with empty songs array
      album.songs = [];
      return album;
    }

    // include songs array in album detail
    album.songs = songsResult.rows || [];

    return album;
  }

  //   add albums
  async addAlbum({ name, year }) {
    const id = "albums-" + nanoid(16);
    const query = {
      text: "INSERT INTO albums VALUES ($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }

    return result.rows[0].id;
  }

  //   delete album
  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = AlbumsService;
