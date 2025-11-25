const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    // verify username
    await this.verifyNewUsername(username);
    // if verify, insert new user in db

    // set unique id
    const id = `user-${nanoid(16)}`;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // set query insert users table
    const query = {
      text: "INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id",
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("User gagal ditambahkan");
    }
    return result.rows[0].id;
  }

  // verify username
  async verifyNewUsername(username) {
    const query = {
      text: "SELECT username FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);

    // if username > 0 show error msg username already use
    if (result.rows.length > 0) {
      throw new InvariantError(
        "Gagal menambahkan user. Username sudah digunakan"
      );
    }
  }

  // verify user credential
  async verifyUserCredential(username, password) {
    // get id & password from user table base on username
    const query = {
      text: "SELECT id, password FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);

    // if username not found, throw authen error
    if (!result.rows.length) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }

    // get id & password from result
    const { id, password: hashedPassword } = result.rows[0];

    // compare password
    const match = await bcrypt.compare(password, hashedPassword);

    // if password not match

    if (!match) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }

    return id;
  }
}

module.exports = UsersService;
