const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const Category = require("../models/Category");
const User = require("../models/User");
const authMiddleware = require("../../middlewares/auth");

router.get("/", async (req, res) => {
  try {
    var session = req.session;
    var categories = await Category.findAll({
      raw: true,
      attributes: ["id", "title", "slug"],
      nest: true,
      include: [
        {
          model: User,
          attributes: ["name", "id"]
        }
      ],
      order: [["id", "DESC"]]
    });
    return res.render("categories/listAll.ejs", { session, categories });
  } catch (err) {}
});

// new category
router.get("/new", authMiddleware, (req, res) => {
  var session = req.session;
  var error = req.flash("error");
  var name = req.flash("name");
  error = error == undefined || error.length == 0 ? undefined : error;
  return res.render("categories/new.ejs", { error, session, name });
});

// POST new category
router.post("/new/add", async (req, res) => {
  let { name } = req.body;
  let error;
  try {
    if (name == undefined || name == "") {
      error = "O campo não pode estar vazio.";
      req.flash("error", error);
      return res.redirect("/categories/new");
    }

    if (await Category.findOne({ where: { title: name } })) {
      error = "Essa categoria ja existe";
      req.flash("error", error);
      req.flash("name", name);
      return res.redirect("/categories/new");
    }

    let slug = slugify(name, {
      lower: true
    });
    let id = req.session.userId;
    Category.create({
      title: name,
      slug: slug,
      userId: id
    });
    return res.redirect("/categories");
  } catch (err) {
    error = "FEDERAL ERROR: " + err;
    req.flash("error", error);
    return res.redirect("/categories");
  }
});

// edit category
router.get("/edit/:id", authMiddleware, async (req, res) => {
  var id = req.params.id;
  var session = req.session;
  var error = req.flash("error");
  try {
    if (isNaN(id)) {
      error = "Erro interno: id";
      req.flash("error", error);
      return res.redirect("/categories/");
    }
  
    var category = await Category.findOne({
      raw: true,
      attributes: ["title", "id"],
      where: { id }
    });
    if (category == undefined || category == null) {
      error = "Erro interno: not found";
      req.flash("error", error);
      return res.redirect("/categories/new");
    }
    error = error == undefined || error.length == 0 ? undefined : error;
    return res.render("categories/edit.ejs", { error, session, category });
  } catch (err) {
    error = "FEDERAL ERROR: " + err;
    req.flash("error", error);
    return res.redirect("/categories");
  }
  
});

// POST edit category
router.post("/edit/:id", authMiddleware, async (req, res) => {
  var id = req.params.id;
  var { name } = req.body;
  var error;
  try {
    if (isNaN(id)) {
      error = "Erro interno: id";
      req.flash("error", error);
      return res.redirect("/categories/");
    }

    if (name == undefined || name == "") {
      error = "O campo não pode estar vazio.";
      req.flash("error", error);
      return res.redirect("/categories/edit/" + id);
    }

    var temp = await Category.findOne({
      raw: true,
      attributes: ["title", "userId"],
      where: { id }
    });
    
    if(await req.session.userId !== temp.userId){
      error = "Erro interno: id";
      req.flash("error", error);
      return res.redirect("/categories");
    }

    if (name == temp.title) {
      error = "O campo tem que ser diferente do original para editar.";
      req.flash("error", error);
      return res.redirect("/categories/edit/" + id);
    }
    var slug = slugify(name, { lower: true });
    Category.update(
      {
        title: name,
        slug: slug
      },
      { where: { id } }
    );
    return res.redirect("/categories");
  } catch (err) {
    error = "FEDERAL ERROR: " + err;
    req.flash("error", error);
    return res.redirect("/categories");
  }
});

// POST delete category
router.post("/delete/:id", authMiddleware, async (req, res) => {
  var id = req.params.id;
  var error;
  try {
    if(isNaN(id)){
      error = "Erro interno: id";
      req.flash("error", error);
      return res.redirect("/categories");
    }

    var temp = await Category.findOne({
      raw: true,
      attributes: ["userId"],
      where: { id }
    });
    if(await req.session.userId !== temp.userId){
      error = "Erro interno: id";
      req.flash("error", error);
      return res.redirect("/categories");
    }
     Category.destroy({where: {id}});
     return res.redirect("/categories");

  } catch (err) {
    error = "FEDERAL ERROR: " + err;
    req.flash("error", error);
    return res.redirect("/categories/");
  }
});

module.exports = (app) => app.use("/categories", router);
