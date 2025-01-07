require("dotenv").config();
const express = require("express");
const { indexRouter } = require("./routes");

const app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(indexRouter);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + listener.address().port);
});
