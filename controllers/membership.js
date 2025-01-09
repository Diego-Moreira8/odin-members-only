require("dotenv").config();
const { db } = require("../database/config");

const getForm = (req, res, next) => {
  res.render("get-membership", { user: req.user });
};

const postAttempt = async (req, res, next) => {
  if (req.body.secret === process.env.MEMBERS_SECRET) {
    await db.query("UPDATE users SET is_member = TRUE WHERE id = $1;", [
      req.user.id,
    ]);

    return res.redirect("/");
  }

  res.status(401).render("get-membership", {
    user: req.user,
    error: "Senha incorreta! Tente novamente.",
  });
};

module.exports = { getForm, postAttempt };
