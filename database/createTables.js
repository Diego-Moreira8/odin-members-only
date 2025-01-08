const { db } = require("./config");

(async () => {
  await db
    .query("DROP TABLE IF EXISTS users, messages;")
    .then(() => console.log("Deleted existing tables"));

  await db
    .query(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        full_name VARCHAR(250),
        username VARCHAR(250) UNIQUE NOT NULL,
        password VARCHAR(250) NOT NULL,
        is_member BOOLEAN NOT NULL DEFAULT FALSE
      );
    `
    )
    .then(() => console.log("Created users table"));

  await db
    .query(
      `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title VARCHAR(250) NOT NULL,
        message VARCHAR(500) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `
    )
    .then(() => console.log("Created messages table"));
})();
