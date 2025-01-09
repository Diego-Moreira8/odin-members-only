const { Router } = require("express");
const authController = require("../controllers/auth");

const authRouter = Router();

authRouter.get("/log-in", authController.getLogIn);
authRouter.post("/log-in", authController.postLogIn);
authRouter.get("/log-out", authController.getLogOut);
authRouter.get("/sign-up", authController.getSignUp);
authRouter.post("/sign-up", authController.postSignUp);

module.exports = { authRouter };
