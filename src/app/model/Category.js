const Sequelize = require("sequelize");
const db = require("../../database");
const User = require("./User");

const Category = db.define("categories", {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  slug: {
    type: Sequelize.STRING,
    allowNull: false
  }
});
Category.belongsTo(User);

//Category.sync({force: false});
module.exports = Category;
