const passport = require("passport");
const LocalStrategy = require("passport-local");
const { db } = require("../database/config");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    return await db
      .query("SELECT * FROM users WHERE username = $1", [username])
      .then((result) => {
        const user = result.rows[0];

        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (user.password !== password) {
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
      const { id, username } = result.rows[0];
      done(null, { id, username });
    })
    .catch((error) => done(error));
});

module.exports = { passport };
