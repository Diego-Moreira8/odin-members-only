const { Router } = require("express");
const { authRouter } = require("./auth");
const { membershipRouter } = require("./membership");

const indexRouter = Router();

indexRouter.use(authRouter);
indexRouter.use(membershipRouter);

indexRouter.get("/", (req, res, next) => {
  res.render("home", { user: req.user, error: null });
});

module.exports = { indexRouter };
