const Sequelize = require("sequelize");
const db = require("../../database");
const User = require("./User");
const Category = require("./Category");

const Article = db.define("articles", {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  body: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  slug: {
    type: Sequelize.STRING,
    allowNull: false
  }
});
Category.hasMany(Article);
Article.belongsTo(Category);
Article.belongsTo(User);

//Article.sync({force: false});
module.exports = Article;
