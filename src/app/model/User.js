const Sequelize = require("sequelize");
const db = require("../../database");
const User = db.define("users", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  pass: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

//User.sync({force: false});
module.exports = User;