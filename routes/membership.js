const { Router } = require("express");
const membershipController = require("../controllers/membership");

const membershipRouter = Router();

membershipRouter.get("/seja-membro", membershipController.getForm);
membershipRouter.post("/seja-membro", membershipController.postAttempt);

module.exports = { membershipRouter };
