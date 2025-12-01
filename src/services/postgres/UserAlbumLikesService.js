const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class UserAlbumLikesService {
  constructor() {
    this._pool = new Pool();
  }

  //   add like
  async addLikeAlbum(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };

    try {
      const result = await this._pool.query(query);

      return result.rows[0].id;
    } catch (error) {
      // if albums already likes
      throw new InvariantError("Anda sudah menyukai album ini");
    }
  }

  //   remove like
  async removeLikeAlbum(userId, albumId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Like tidak ditemukan");
    }
  }

  // count like
  async countLikes(albumId) {
    const query = {
      text: "SELECT COUNT(*) as count FROM user_album_likes WHERE album_id = $1",
      values: [albumId],
    };
    const result = await this._pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = UserAlbumLikesService;
