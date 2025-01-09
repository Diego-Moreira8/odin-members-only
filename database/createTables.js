require("dotenv").config();
const bcrypt = require("bcrypt");
const { db } = require("./config");

(async () => {
  await db
    .query("DROP TABLE IF EXISTS users, messages;")
    .then(() => console.log("Deleted existing tables"))
    .catch((err) => console.error(err));

  await db
    .query(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        full_name VARCHAR(250),
        username VARCHAR(250) UNIQUE NOT NULL,
        password VARCHAR(250) NOT NULL,
        is_member BOOLEAN NOT NULL DEFAULT FALSE,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE
      );
    `
    )
    .then(() => console.log("Created users table"))
    .catch((err) => console.error(err));

  await db
    .query(
      `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title VARCHAR(250),
        content VARCHAR(500) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `
    )
    .then(() => console.log("Created messages table"))
    .catch((err) => console.error(err));

  bcrypt.hash(
    process.env.ADMIN_PASSWORD,
    parseInt(process.env.HASH_SALT),
    async (err, hashedPassword) => {
      if (err) {
        return console.error(err);
      }
      await db
        .query(
          `
            INSERT INTO users (username, password, is_member, is_admin)
            VALUES ('admin', $1, $2, $3);
          `,
          [hashedPassword, true, true]
        )
        .then(console.log("Created admin user"))
        .catch((err) => console.error(err));
    }
  );
})();
