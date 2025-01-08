const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const { db } = require("../database/config");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    return await db
      .query("SELECT * FROM users WHERE username = $1", [username])
      .then(async (result) => {
        const user = result.rows[0];

        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      })
      .catch((error) => done(error));
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  return await db
    .query("SELECT * FROM users WHERE id = $1", [id])
    .then((result) => {
      const { id, username, full_name, is_member } = result.rows[0];
      done(null, { id, username, full_name, is_member });
    })
    .catch((error) => done(error));
});

module.exports = { passport };
