const Sequelize = require("sequelize");
const db = require("../../database");
const User = require("./User.js");
const Article = require("./Article");

const Message = db.define("messages", {
  body: {
    type: Sequelize.STRING,
    allowNull: false
  },
  likes: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
Message.belongsTo(User);
Message.belongsTo(Article);

// Message.sync({force: false});
module.exports = Message;