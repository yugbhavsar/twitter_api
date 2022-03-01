const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();
const dbInstance = db.getDbInstance();

module.exports = async(sql_query)=>{
  const connection = await dbInstance.getConnection();
  let result = await connection.query(sql_query);
  return result;
}