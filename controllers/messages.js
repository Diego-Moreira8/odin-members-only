const { body, validationResult } = require("express-validator");
const { db } = require("../database/config");

const getNewMessageForm = (req, res, next) => {
  res.render("new-message", { user: req.user, errors: [] });
};

const postNewMessage = [
  body("title")
    .trim()
    .isLength({ max: 250 })
    .withMessage("O título pode ter no máximo 250 caracteres"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Uma mensagem precisa ser fornecida")
    .isLength({ max: 500 })
    .withMessage("A mensagem pode ter no máximo 500 caracteres"),

  async function validateMessage(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("new-message", { user: req.user, errors: errors.array() });
    }

    const { title, content } = req.body;
    const currentTime = new Date();
    await db.query(
      `
        INSERT INTO messages(title, content, created_at, user_id)
        VALUES ($1, $2, $3, $4);
      `,
      [title, content, currentTime, req.user.id]
    );

    res.redirect("/");
  },
];

module.exports = { getNewMessageForm, postNewMessage };
