const { nanoid } = require("nanoid");
const { Pool } = require("pg");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  // add song to playlist
  async addSongToPlaylist(playlistId, songId, userId) {
    // verify song exists
    const songQuery = {
      text: "SELECT id FROM songs WHERE id = $1",
      values: [songId],
    };

    // check if song not found
    const songResult = await this._pool.query(songQuery);
    if (!songResult.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }

    // check if song already add in playlist
    const existsSongInPlaylist = {
      text: "SELECT id FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2",
      values: [playlistId, songId],
    };
    const exists = await this._pool.query(existsSongInPlaylist);
    if (exists.rows.length) {
      throw new InvariantError("Lagu sudah ditambahkan di playlist");
    }

    const id = "playlistsongs-" + nanoid(16);
    const query = {
      text: "INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan ke playlist");
    }

    // insert record activity
    const activityId = "playlistactivity-" + nanoid(16);
    const activityQuery = {
      text: "INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, NOW())",
      values: [activityId, playlistId, songId, userId, "add"],
    };
    await this._pool.query(activityQuery);

    return result.rows[0].id;
  }

  //   get song in playlist
  async getSongInPlaylist(playlistId) {
    // get playlist info with owner's username
    const playlistQuery = {
      text: `SELECT p.id, p.name, u.username
             FROM playlists p
             JOIN users u ON u.id = p.owner
             WHERE p.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = playlistResult.rows[0];

    // get songs in the playlist
    const songsQuery = {
      text: `SELECT s.id, s.title, s.performer
             FROM songs s
             JOIN playlist_songs ps ON s.id = ps.song_id
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };

    const songsResult = await this._pool.query(songsQuery);
    playlist.songs = songsResult.rows;

    return playlist;
  }

  //   delete song in playlist
  async deleteSongInPlaylist(playlistId, songId, userId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan di playlist");
    }

    // insert record activity
    const activityId = "playlistactivity-" + nanoid(16);
    const activityQuery = {
      text: "INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, NOW())",
      values: [activityId, playlistId, songId, userId, "delete"],
    };
    await this._pool.query(activityQuery);
  }
}

module.exports = PlaylistSongsService;
