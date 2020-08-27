const express = require("express");
const router = express.Router();;
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const loggedMiddleware = require("../../middlewares/logged");

// login

router.get("/", loggedMiddleware, (req, res) => {
  var error = req.flash("error");
  error = (error === undefined || error.length === 0) ? undefined : error;
  return res.render("auth/login.ejs", {
    error,
    email: req.flash("email")
  });
});

  // login - authenticate

router.post("/authenticate", loggedMiddleware, async(req, res) => {
  let { email, pass } = req.body;
  let error;
  try {    
    email = email.toLowerCase();
    
    if(email === undefined || email === ""){
      error = "O campo \'EMAIL\' não pode ser vazio.";
      req.flash("error", error);  req.flash("email", email); 
      return res.redirect("/login");
    }

    if(pass === undefined || pass === ""){
      error = "O campo \'SENHA\' não pode ser vazio.";
      req.flash("error", error);  req.flash("email", email);     
      return res.redirect("/login");
    }

    let user = await User.findOne({where: {email}});

    if(user == null){
      error = "Usuário não existe.";
      req.flash("error", error);  req.flash("email", email);     
      return res.redirect("/login");
    }

    if (await bcrypt.compare(pass, user.pass)) {
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.name = user.name;
      req.session.logged = true;

      return res.redirect("/");
    } else {
      error = "Senha incorreta.";
      req.flash("error", error);  req.flash("email", email);     
      return res.redirect("/login");
    }    
  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);  req.flash("email", email);     
    return res.redirect("/login");
  }
});

// register 

router.get("/register", loggedMiddleware, (req, res) => {
  var error = req.flash("error");
  error = (error === undefined || error.length === 0) ? undefined : error;
  return res.render("auth/register.ejs", {
    error,
    name: req.flash("name"),
    email: req.flash("email")
  });
});

  // register - add

router.post("/add", loggedMiddleware, async (req, res) => {
  let { name, email, pass1, pass2 } = req.body;
  let error;
  try {
    email = email.toLowerCase();

    if(name === undefined || name === ""){
      error = "O campo \'NOME\' não pode ser vazio.";
      req.flash("error", error);  req.flash("name", name);  req.flash("email", email); 
      return res.redirect("/login/register");
    }
    
    if(email === undefined || email === ""){
      error = "O campo \'EMAIL\' não pode ser vazio.";
      req.flash("error", error);  req.flash("name", name);  req.flash("email", email); 
      return res.redirect("/login/register");
    }

    if(pass1 === undefined || pass1 === ""){
      error = "O campo \'SENHA\' não pode ser vazio.";
      req.flash("error", error);  req.flash("name", name);  req.flash("email", email);     
      return res.redirect("/login/register");
    }

    if(name.length < 3){
      error = "O campo \'NOME\' não pode ter menos que 3 caracteres.";
      req.flash("error", error);  req.flash("name", name);  req.flash("email", email);     
      return res.redirect("/login/register");
    }

    if(pass1.length < 6){
      error = "O campo \'SENHA\' não pode ter menos que 6 caracteres.";
      req.flash("error", error);  req.flash("name", name);  req.flash("email", email);     
      return res.redirect("/login/register");
    }

    if(pass1 !== pass2){
      error = "Os campos \'SENHA\' não são iguais.";
      req.flash("error", error);  req.flash("name", name);  req.flash("email", email);     
      return res.redirect("/login/register");
    }

    if(await User.findOne({where: {email}})){
      error = "Esse e-mail já está cadastrado.";
      req.flash("error", error);  req.flash("name", name);  req.flash("email", email); 
      return res.redirect("/login/register");
    }

    const hash = await bcrypt.hash(pass1, 10);
    const temp_user = {name, email, pass: hash};

    let user = await User.create(temp_user);

    req.session.userId = user.id;
    req.session.name = user.name;
    req.session.email = user.email;
    req.session.logged = true;

    return res.redirect("/");

  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);  req.flash("name", name);  req.flash("email", email); 
    return res.redirect("/login/register");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  return res.redirect("/");
})


module.exports = app => app.use("/login", router);