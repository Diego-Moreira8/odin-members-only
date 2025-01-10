require("dotenv").config();
const { db } = require("../database/config");

const checkUser = (req) => {
  if (!req.user) {
    throw {
      statusCode: 401,
      message: "Você precisa estar conectado para acessar esta página",
    };
  }
};

const getForm = (req, res, next) => {
  checkUser(req);

  res.render("layout", {
    template: "get-membership",
    title: "Seja Membro",
    user: req.user,
  });
};

const postAttempt = async (req, res, next) => {
  checkUser(req);

  if (req.body.secret === process.env.MEMBERS_SECRET) {
    await db.query("UPDATE users SET is_member = TRUE WHERE id = $1;", [
      req.user.id,
    ]);

    return res.redirect("/");
  }

  res.status(401).render("layout", {
    template: "get-membership",
    title: "Seja Membro",
    user: req.user,
    error: "Senha incorreta! Tente novamente.",
  });
};

module.exports = { getForm, postAttempt };
