const { Router } = require("express");
const { authRouter } = require("./auth");
const { membershipRouter } = require("./membership");
const { messagesRouter } = require("./messages");
const { db } = require("../database/config");

const indexRouter = Router();

indexRouter.use(authRouter);
indexRouter.use(membershipRouter);
indexRouter.use(messagesRouter);

indexRouter.get("/", async (req, res, next) => {
  await db
    .query(
      `
        SELECT created_at, full_name, username, title, content
        FROM messages
        JOIN users
        ON users.id = messages.user_id;
      `
    )
    .then((result) => {
      const messages = result.rows;
      res.render("home", { user: req.user, error: null, messages });
    })
    .catch((err) => next(err));
});

module.exports = { indexRouter };
