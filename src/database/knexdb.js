const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "remotemysql.com",
    user: "HRW0nXUlhD",
    password: "8zAV99ETD4",
    database: "HRW0nXUlhD"
  }
});
module.exports = knex;