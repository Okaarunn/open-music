exports.up = (pgm) => {
  pgm.renameColumn("songs", "albumId", "album_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.renameColumn("songs", "album_id", "albumId");
};
