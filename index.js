const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const performQuery = require('./performQuery');
const axios = require('axios');
const url = require('url');
dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use((req, res, next) => {
  res.setHeader('content-type','application/json');
  next();
});

// let insert_sql_query_exp =
// `INSERT INTO work_exp_detail(id, company_name, designation, starting_date, leaveing_date) VALUES (` +
// `${basicId},'${companyName}','${desg}','${starting}','${ending}')`;
// let result = await performQuery(insert_sql_query_exp); 


app.listen(port, () =>{
  console.log(`app up on port ${port}`)
});