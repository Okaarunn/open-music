const { Pool } = require("pg");

class PlaylistSongActivities {
  constructor() {
    this._pool = new Pool();
  }

  // get activities in playlist

  async getActivitiesInPlaylist(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, a.action, a.time
             FROM playlist_song_activities a
             JOIN users u ON u.id = a.user_id
             JOIN songs s ON s.id = a.song_id
             WHERE a.playlist_id = $1
             ORDER BY a.time ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistSongActivities;
