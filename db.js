const mysql = require('promise-mysql');
const dotenv = require('dotenv');
dotenv.config();

let instance = null;

let connection = mysql.createConnection({
  user : process.env.DB_USERNAME,
  password : process.env.DB_PASSWORD,
  host : process.env.DB_HOSTNAME,
  port : process.env.DB_PORT,
  database : process.env.DB_DATABASENAME
});

class Db{
  static getDbInstance(){
    return instance ? instance : new Db();
  }

  getConnection(){
    return connection;
  }
}

module.exports = Db;
