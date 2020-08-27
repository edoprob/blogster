const Sequelize = require("sequelize");
const db = new Sequelize("HRW0nXUlhD", "HRW0nXUlhD", "8zAV99ETD4", {
  dialect: "mysql",
  host: "remotemysql.com",
  port: 3306,
  timezone: "-03:00"
});
module.exports = db;