const { Router } = require("express");
const messagesController = require("../controllers/messages");

const messagesRouter = Router();

messagesRouter.get("/criar-mensagem", messagesController.getNewMessageForm);
messagesRouter.post("/criar-mensagem", messagesController.postNewMessage);
messagesRouter.post(
  "/delete-message/:id",
  messagesController.postDeleteMessage
);

module.exports = { messagesRouter };
