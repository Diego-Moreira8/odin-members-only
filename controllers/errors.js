const pageNotFound = (req, res, next) => {
  throw { statusCode: 404, message: "Página não encontrada" };
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const errStatus = err.statusCode || 500;
  const errMsg = err.message || "Erro interno do servidor";

  res.status(errStatus).render("layout", {
    template: "error",
    title: "Erro",
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};

module.exports = { pageNotFound, errorHandler };
