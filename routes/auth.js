const { Router } = require("express");
const { passport } = require("../authentication/config");
const bcrypt = require("bcrypt");
const { db } = require("../database/config");

const authRouter = Router();

authRouter.get("/login", (req, res, next) => {
  res.render("login");
});

authRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

authRouter.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    res.redirect("/");
  });
});

authRouter.get("/signup", (req, res, next) => {
  res.render("signup");
});

authRouter.post("/signup", async (req, res, next) => {
  const { full_name, username, password } = req.body;

  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    if (err) next(err);

    await db
      .query(
        `
          INSERT INTO users (full_name, username, password)
          VALUES ($1, $2, $3);
        `,
        [full_name, username, hashedPassword]
      )
      .then(() => res.redirect("/"))
      .catch((err) => next(err));
  });
});

module.exports = { authRouter };
