const mysql = require("mysql2");
require('dotenv').config();

const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
  
    // process.env.DB_NAME,
    // process.env.DB_USER,
    // process.env.DB_PASSWORD,
    // {
    //   host: 'localhost',
    //   dialect: 'mysql',
    //   port: 3306,
    //   user: 
    }
  );

  connection.connect(function (err) {
    if (err) throw err;
  });

  module.exports = connection;