const { passport } = require("../authentication/config");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { db } = require("../database/config");

const loginValidators = [
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
];

const signUpValidators = [
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
    .custom(async function checkUsernameUnique(value, { req }) {
      await db
        .query("SELECT * FROM users WHERE username = $1;", [value])
        .then((result) => {
          if (result.rowCount > 0) {
            throw new Error("Este nome de usuário já existe");
          }
          return true;
        })
        .catch((err) => {
          req.locals = { queryError: err };
          throw err;
        });
    }),

  body("password")
    .notEmpty()
    .withMessage("Uma senha precisa ser fornecida")
    .isLength({ min: 8, max: 250 })
    .withMessage("A senha precisa ter entre 8 e 250 caracteres"),

  body("password_confirmation").custom(function checkPasswordMatch(
    value,
    { req }
  ) {
    if (value !== req.body.password) {
      throw new Error("As senhas não são iguais");
    }

    return true;
  }),
];

const getLogIn = (req, res, next) => {
  res.render("log-in", { errors: [] });
};

const postLogIn = [
  loginValidators,

  function validateForm(req, res, next) {
    const formErrors = validationResult(req);
    if (!formErrors.isEmpty()) {
      return res.status(400).render("log-in", { errors: formErrors.array() });
    }
    next();
  },

  function authenticateUser(req, res, next) {
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
  },
];

const getLogOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

const getSignUp = (req, res, next) => {
  res.render("sign-up", { errors: [] });
};

const postSignUp = [
  signUpValidators,

  function checkForQueryError(req, res, next) {
    if (req.locals?.queryError) {
      next(req.locals.queryError);
    }
    next();
  },

  async function validateForm(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up", { errors: errors.array() });
    }

    const { full_name, username, password } = req.body;

    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) {
        next(err);
      }
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
  },
];

module.exports = { getLogIn, postLogIn, getLogOut, getSignUp, postSignUp };
