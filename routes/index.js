const { Router } = require("express");
const { authRouter } = require("./auth");

const indexRouter = Router();

indexRouter.use(authRouter);

indexRouter.get("/", (req, res, next) => {
  res.render("home", { user: req.user });
});

module.exports = { indexRouter };
