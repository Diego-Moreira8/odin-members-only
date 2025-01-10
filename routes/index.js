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
        SELECT m.id, created_at, full_name, username, user_id, title, content
        FROM messages AS m
        JOIN users AS u
        ON u.id = m.user_id;
      `
    )
    .then((result) => {
      const messages = result.rows;
      res.render("home", { user: req.user, error: null, messages });
    })
    .catch((err) => next(err));
});

module.exports = { indexRouter };
