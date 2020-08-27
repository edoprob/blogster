const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const Category = require("../models/Category");
const User = require("../models/User");
const Message = require("../models/Message");
const authMiddleware = require("../../middlewares/auth");

// home
router.get("/", async (req, res) => {
  var session = req.session;
  var error = req.flash("error");
  try {
    var articles = await Article.findAll({
      raw: true,
      nest: true,
      include: [{
        model: Category,
        attributes: ['id', 'title', 'slug']
      },{
        model: User, 
        attributes: ['id', 'name']
      }],
      order: [['id', 'DESC']]
    });
    error = error === undefined || error.length === 0 ? undefined : error;
    return res.render("home", { error, session, articles });
  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);
    return res.redirect("/articles");
  }
});

//  view 
router.get("/view/:slug", async (req, res) => {
  var session = req.session;
  var error = req.flash("error");
  var slug = req.params.slug;
  try {

    if (slug === undefined || slug === "") {
      error = "Erro interno: slug";
      req.flash("error", error);
      return res.redirect("/articles");
    }

    var article = await Article.findOne({
      raw: true,
      nest: true,
      where: {slug},
      include:[{
        model: Category,
        attributes: ['title', 'id', 'slug']
      },{
        model: User,
        attributes: ['name', 'id']
      }]
    });

    var messages = await Message.findAll({
      raw: true,
      nest: true,
      where: {articleId: article.id},
      order: [['likes', 'DESC']],
      include: {
        model: User,
        attributes: ['name']
      }
    });
    error = error === undefined || error.length === 0 ? undefined : error;
    return res.render("view", { error, session, article, messages });
    
  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);
    return res.redirect("/articles");
  }
});

// POST messages
router.post("/view/msg/:id", authMiddleware, async (req, res) => {
  try {
    var id = req.params.id
    var msg =  req.body.msg;
    var article = await Article.findOne({where: {id}, attributes: ['slug', 'id']});

    Message.create({
      body: msg,
      likes: 0,
      userId: req.session.userId,
      articleId: id
     });
     res.redirect("/view/"+article.slug);

  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);
    return res.redirect("/articles");
  }
});

// POST like
router.post("/view/like/:idArt/:idMsg", authMiddleware, async (req, res) => {
const db = require("../../database/knexdb");
  try {    
    var error;
    var { idMsg, idArt } = req.params;
    
    var article = await Article.findOne({
      raw: true,
      where: {id: idArt}, 
      attributes: ['slug']
    });
    if(article == null || article == []) {
      error = "Internal error";
      req.flash("error", error);
      return res.redirect("/articles");
    }
    var message = await Message.findOne({
      raw: true,
      where: {id: idMsg}, 
      attributes: ['likes']
    });

    if(message == null || message == []) {
      error = "Internal error";
      req.flash("error", error);
      return res.redirect("/view/"+article.slug);
    }

//comecei no knex agora, e por isso fiz isso
    var like = await db.select().table("likes").where({
      userId: req.session.userId,
      msgId: idMsg
    });

    if(like == [] || like.length == 0){

      await db("likes").insert(({userId: req.session.userId, msgId: idMsg}));
      message.likes += 1;  
      await db("messages").where({id: idMsg}).update({likes: message.likes});

      return res.redirect("/view/"+article.slug);
    } else {

      await db("likes").where("userId", req.session.userId).andWhere("msgId", idMsg).delete();
      message.likes -= 1;
      await db("messages").where({id: idMsg}).update({likes: message.likes})

      return res.redirect("/view/"+article.slug);
    }

  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);
    return res.redirect("/view/"+article.slug);
  }
});


// category
router.get("/category/:slug", async (req, res) => {
  var session = req.session;
  var error = req.flash("error");
  var slug = req.params.slug;
  try {
    if (slug === undefined || slug === "") {
      error = "Erro interno: slug";
      req.flash("error", error);
      return res.redirect("/categories");
    }

    var category = await Category.findOne({
      raw:true,
      nest: true,
      where: {slug},
      include: {
        model: User,
        attributes: ['id', 'name']
      }
    })
    
    var articles =  await Article.findAll({
      raw: true,
      nest: true,
      where: {categoryId: category.id},
      attributes: ['id','title','slug','createdAt'],
      include:[{
        model: Category,
        attributes: ['title', 'id']
      },{
        model: User,
        attributes: ['name', 'id']
      }],
      order: [['id', 'DESC']]
    });
    if(articles === null || articles.length === 0){
      articles = "não há artigos"
    }
    error = error === undefined || error.length === 0 ? undefined : error;
    return res.render("category", { error, session, articles, category });

  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);
    return res.redirect("/articles");
  }
});

// user
router.get("/user/:id", async (req, res) => {
  var session = req.session;
  var error;
  var articles;
  var id = req.params.id;
  try {
    if (id === undefined || id === "") {
      error = "Erro interno: id und";
      req.flash("error", error);
      return res.redirect("/");
    }
    if (isNaN(id)) {
      error = "Erro interno: id NaN";
      req.flash("error", error);
      return res.redirect("/");
    }
  
    var user = await User.findOne({
      raw:  true,
      nest: true,
      where: {id},
      attributes: ['id', 'name', 'email', 'createdAt']
    });
    if (user === null) {
      error = "Erro interno: 404";
      req.flash("error", error);
      return res.redirect("/");
    }
    var articles = await Article.findAll({
      raw: true,
      where: {userId: id},
      order: [['id', 'DESC']]
    });
  
    if(articles == null || articles.length === 0){
      articles = "não há artigos"
    }
    return res.render("user", { session, user, articles });

  } catch (err) {
    error = "FEDERAL ERROR: "+err;
    req.flash("error", error);
    return res.redirect("/articles");
  }
});

module.exports = (app) => app.use("/", router);