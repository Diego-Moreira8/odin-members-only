const { Router } = require("express");
const { passport } = require("../authentication/config");
const bcrypt = require("bcrypt");
const { db } = require("../database/config");
const { body, validationResult } = require("express-validator");

const authRouter = Router();

authRouter.get("/log-in", (req, res, next) => {
  res.render("log-in", { errors: [] });
});

authRouter.post(
  "/log-in",

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Um nome de usuário precisa ser fornecido")
    .isLength({ max: 250 })
    .withMessage("O nome de usuário pode ter no máximo 250 caracteres"),

  body("password")
    .notEmpty()
    .withMessage("Uma senha precisa ser fornecida")
    .isLength({ max: 250 })
    .withMessage("Uma senha pode ter no máximo 250 caracteres"),

  (req, res, next) => {
    const formErrors = validationResult(req);

    if (!formErrors.isEmpty()) {
      return res.status(400).render("log-in", { errors: formErrors.array() });
    }

    next();
  },

  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(401)
          .render("log-in", { errors: [{ msg: info.message }] });
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    })(req, res, next);
  }
);

authRouter.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    res.redirect("/");
  });
});

authRouter.get("/sign-up", (req, res, next) => {
  res.render("sign-up", { errors: [] });
});

authRouter.post(
  "/sign-up",

  body("full_name")
    .trim()
    .isLength({ max: 250 })
    .withMessage("O nome pode ter no máximo 250 caracteres"),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Um nome de usuário precisa ser fornecido")
    .isLength({ max: 250 })
    .withMessage("O nome de usuário pode ter no máximo 250 caracteres")
    .custom(async (value) => {
      await db
        .query("SELECT * FROM users WHERE username = $1;", [value])
        .then((result) => {
          if (result.rowCount > 0) {
            throw new Error("Este nome de usuário já existe");
          }

          return true;
        })
        .catch((err) => {
          throw err;
        });
    }),

  body("password")
    .notEmpty()
    .withMessage("Uma senha precisa ser fornecida")
    .isLength({ min: 8, max: 250 })
    .withMessage("A senha precisa ter entre 8 e 250 caracteres"),

  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("As senhas não são iguais");
    }

    return true;
  }),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up", { errors: errors.array() });
    }

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
  }
);

module.exports = { authRouter };
