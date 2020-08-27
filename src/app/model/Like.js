const db = require("../../database");
const User = require("./User");
const Article = require("./Article")
const Like = db.define("likes", {});
Like.belongsTo(User);
Like.belongsTo(Article);

// Like.sync({force:false});
module.exports = Like;