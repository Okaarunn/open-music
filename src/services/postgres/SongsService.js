const { Pool } = require("pg");
const NotFoundError = require("../../exceptions/NotFoundError");

const InvariantError = require("../../exceptions/InvariantError");
const { nanoid } = require("nanoid");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  //   get all songs
  async getSongs(title, performer) {
    // search by title & performer
    if (title && performer) {
      const query = {
        text: "SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2",
        values: [`%${title}%`, `%${performer}%`],
      };
      const result = await this._pool.query(query);
      return result.rows;
    }

    // search by title
    if (title) {
      const query = {
        text: "SELECT id, title, performer FROM songs WHERE title ILIKE $1",
        values: [`%${title}%`],
      };
      const result = await this._pool.query(query);
      return result.rows;
    }

    // search by performer
    if (performer) {
      const query = {
        text: "SELECT id, title, performer FROM songs WHERE performer ILIKE $1",
        values: [`%${performer}%`],
      };
      const result = await this._pool.query(query);
      return result.rows;
    }

    const query = "SELECT id, title, performer FROM songs";
    const result = await this._pool.query(query);

    return result.rows;
  }

  //   get song by id
  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }

    return result.rows[0];
  }

  // add song
  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = "songs-" + nanoid(16);
    const query = {
      text: "INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  // edit songs
  async editSongById(id, { title, year, performer, genre, duration }) {
    const query = {
      text: "UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5 WHERE id = $6 RETURNING id",
      values: [title, year, performer, genre, duration, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui lagu. Id tidak ditemukan");
    }

    return result.rows[0].id;
  }

  // delete songs
  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = SongsService;
