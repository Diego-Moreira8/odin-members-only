const { body, validationResult } = require("express-validator");
const { db } = require("../database/config");

const getNewMessageForm = (req, res, next) => {
  res.render("layout", {
    template: "new-message",
    title: "Nova Mensagem",
    user: req.user,
    errors: [],
  });
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
      return res.status(400).render("layout", {
        template: "new-message",
        title: "Nova Mensagem",
        user: req.user,
        errors: errors.array(),
      });
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

const postDeleteMessage = async (req, res, next) => {
  try {
    const msgId = req.params.id;
    const { rows } = await db.query(
      "SELECT user_id FROM messages WHERE id = $1;",
      [msgId]
    );
    if (rows.length === 0) {
      throw { statusCode: 404, message: "Mensagem não encontrada" };
    }

    const authorOrAdmin = rows[0].user_id === req.user.id || req.user.is_admin;
    if (!authorOrAdmin) {
      throw {
        statusCode: 401,
        message: "Você não tem autorização para apagar esta mensagem",
      };
    }

    await db.query("DELETE FROM messages WHERE id = $1;", [msgId]);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

module.exports = { getNewMessageForm, postNewMessage, postDeleteMessage };
