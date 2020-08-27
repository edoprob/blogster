const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const db = require("./database");
db.authenticate()
  .then(() => { console.log("DB connected"); })
  .catch((err) => { console.log(err); });

app.set("view engine", "ejs");
app.set("views", "src/app/views");
app.use(cookieParser("motherfuckerdolphinagain"));
app.use(
  session({
    secret: "motherfuckerdolphin",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
  })
);
app.use(flash());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("./app/controllers/homeController")(app);
require("./app/controllers/authController")(app);
require("./app/controllers/articleController")(app);
require("./app/controllers/categoriesController")(app);

app.listen(3000, () => {
  console.log("app rodando!");
});
