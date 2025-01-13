require("dotenv").config();
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
    .custom(async function checkUsernameUnique(value) {
      await db
        .query("SELECT * FROM users WHERE username = $1;", [
          value.toLowerCase(),
        ])
        .then((result) => {
          if (result.rowCount > 0) {
            throw new Error(`O usuário ${value} já existe`);
          }
          return true;
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
  res.render("layout", { template: "log-in", title: "Entrar", errors: [] });
};

const postLogIn = [
  loginValidators,

  function validateForm(req, res, next) {
    const formErrors = validationResult(req);
    if (!formErrors.isEmpty()) {
      return res.status(400).render("layout", {
        template: "log-in",
        title: "Entrar",
        errors: formErrors.array(),
      });
    }
    next();
  },

  function lowerCaseUsername(req, res, next) {
    req.body.username = req.body.username.toLowerCase();
    next();
  },

  function authenticateUser(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).render("layout", {
          template: "log-in",
          title: "Entrar",
          errors: [{ msg: info.message }],
        });
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
  res.render("layout", {
    template: "sign-up",
    title: "Registrar",
    errors: [],
    full_name: "",
  });
};

const postSignUp = [
  signUpValidators,

  async function validateForm(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("layout", {
        template: "sign-up",
        title: "Registrar",
        errors: errors.array(),
        full_name: req.body.full_name,
      });
    }

    const { full_name, username, password } = req.body;

    bcrypt.hash(
      password,
      parseInt(process.env.HASH_SALT),
      async (err, hashedPassword) => {
        if (err) {
          next(err);
        }
        await db
          .query(
            `
            INSERT INTO users (full_name, username, password)
            VALUES ($1, $2, $3);
          `,
            [full_name, username.toLowerCase(), hashedPassword]
          )
          .then(() => res.redirect("/"))
          .catch((err) => next(err));
      }
    );
  },
];

module.exports = { getLogIn, postLogIn, getLogOut, getSignUp, postSignUp };
