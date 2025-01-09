const { Router } = require("express");
const messagesController = require("../controllers/messages");

const messagesRouter = Router();

messagesRouter.get("/criar-mensagem", messagesController.getNewMessageForm);
messagesRouter.post("/criar-mensagem", messagesController.postNewMessage);

module.exports = { messagesRouter };
