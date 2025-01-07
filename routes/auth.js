const { Router } = require("express");

const authRouter = Router();

authRouter.get("/login", (req, res, next) => {
  res.render("login");
});

authRouter.post("/login", (req, res, next) => {
  // TODO
});

authRouter.get("/signup", (req, res, next) => {
  res.render("signup");
});

authRouter.post("/signup", (req, res, next) => {
  // TODO
});

module.exports = { authRouter };
