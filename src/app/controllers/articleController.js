const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const Article = require("../models/Article")
const Category = require("../models/Category");
const User = require("../models/User");
const authMiddleware = require("../../middlewares/auth");

router.get("/", async (req, res) => {
  var session = req.session;
  var error = req.flash("error");
  error = (error === undefined || error.length === 0) ? undefined : error;
  var articles = await Article.findAll({
    raw: true,
    attributes: ['id', 'title', 'slug'],
    nest: true,
    include: [{
      model: User,
      attributes: ['name', 'id']
    },{
      model: Category,
      attributes: ['title', 'id', 'slug']   
    }],
    order: [
      ['id', 'DESC']
    ]
  });
  return res.render("articles/listAll.ejs", { session, articles, error });
});

// new article
router.get("/new", authMiddleware, async (req, res) => {
  var session = req.session;
  var error = req.flash("error");
  var body = req.flash("body");
  var categories = await Category.findAll({
    raw: true,
    attributes: ['id', 'title']
  });
  error = error === undefined || error.length === 0 ? undefined : error;
  return res.render("articles/new.ejs", { session, error, body, categories });
});

  // POST new article
router.post("/new/add", authMiddleware, async (req, res) => {
  var { title, category, body } = req.body;
  var error;

  try {
    if (isNaN(category)) {
      error = "Selecione uma categoria válida";
      req.flash("error", error);
      req.flash("body", body);
      return res.redirect("/articles/new");
    }
    if (title == undefined || title == "") {
      error = "O campo 'TÍTULO' não pode estar vazio.";
      req.flash("error", error);
      req.flash("body", body);
      return res.redirect("/articles/new");
    }
    if (body == undefined || body == "") {
      error = "O campo 'TEXTO' não pode estar vazio.";
      req.flash("error", error);
      return res.redirect("/articles/new");
    }
    if(await Article.findOne({where: {title}}) !== null){
      error = "Esse título da existe";
      req.flash("error", error);
      req.flash("body", body);
      return res.redirect("/articles/new");
    }
    
    if (await Category.findOne({where: {id: category}}) !== null) {
      Article.create({
        title,
        body,
        slug: slugify(title, {lower: true}),
        categoryId: category,
        userId: req.session.userId
      });
      return res.redirect("/articles");

    } else {
      error = "Selecione uma categoria válida";
      req.flash("error", error);
      req.flash("body", body);
      return res.redirect("/articles/new");
    }
  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);
    req.flash("body", body);
    return res.redirect("/articles/new");
  }
})

// edit article
router.get("/edit/:id", authMiddleware, async (req, res) => {
  var id = req.params.id;
  var session = req.session;
  var error = req.flash("error");
  error = error === undefined || error.length === 0 ? undefined : error;
  try {
    if (isNaN(id) || id === undefined || id === "") {
      error = "Internal error: " + err;
      req.flash("error", error);
      return res.redirect("/articles");
    }

    var article = await Article.findOne({
      raw: true,
      attributes: ['id', 'title', 'body', 'categoryId', 'userId'],
      where: {id}
    });
    if(article == null){
      res.redirect("/articles");
    }
    var categories = await Category.findAll({
      raw: true,
      attributes: ['id', 'title']
    });

    return res.render("articles/edit.ejs", { error, session, article, categories });
  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);
    return res.redirect("/articles");
  }
});

// POST edit article
router.post("/edit/:id", authMiddleware, async (req, res) => {
  var id = req.params.id;
  var { title, body, categoryId } = req.body;
  var error;
  try {
    if (isNaN(id)) {
      error = "Erro interno: id";
      req.flash("error", error);
      return res.redirect("/articles/");
    }
    
    if (isNaN(categoryId)) {
      error = "Erro interno: categoria";
      req.flash("error", error);
      return res.redirect("/articles/edit/" + id);
    }

    if (title == undefined || title == "") {
      error = "O campo 'TÍTULO' não pode estar vazio.";
      req.flash("error", error);
      return res.redirect("/articles/edit/" + id);
    }

    if (body == undefined || body == "") {
      error = "O campo 'TEXTO' não pode estar vazio.";
      req.flash("error", error);
      return res.redirect("/articles/edit/" + id);
    }
    
    var temp = await Article.findOne({
      raw: true,
      attributes: ["userId"],
      where: { id }
    });
    console.log("aaaaa")
    if(temp == null){
      error = "Erro interno: id";
      req.flash("error", error);
      res.redirect("/articles");
    }
  
    if(await req.session.userId !== temp.userId){
      error = "Erro interno: id";
      req.flash("error", error);
      return res.redirect("/articles");
    }
    console.log(title, body, slug, categoryId);
    var slug = slugify(title, { lower: true });
    console.log("bbbbb")

    Article.update(
      {
        title,
        slug,
        body,
        categoryId
      },
      { where: { id } }
    );
    return res.redirect("/articles");
  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);
    return res.redirect("/articles/new");
  }
});

// POST delete article
router.post("/delete/:id", authMiddleware, async (req, res) => {
  var id = req.params.id;
  var error;
  try {
    if(isNaN(id)){
      error = "Erro interno: id";
      req.flash("error", error);
      return res.redirect("/articles");
    }
    var temp = await Article.findOne({
      raw: true,
      attributes: ["userId"],
      where: { id }
    });
    if(await req.session.userId !== temp.userId){
      error = "Erro interno: id";
      req.flash("error", error);
      return res.redirect("/articles");
    }
     Article.destroy({where: {id}});
     return res.redirect("/articles");

  } catch (err) {
    error = "FEDERAL ERROR: " + err;
    req.flash("error", error);
    return res.redirect("/articles");
  } 
});

module.exports = (app) => app.use("/articles", router);
