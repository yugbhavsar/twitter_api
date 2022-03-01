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

app.get("/public/followFollowing/:user_id",async(req,res)=>{
  let user_id = req.params.user_id || null;
  let data = {};
  try{
    if(user_id){
      let following_count_query = `select count(follower_id) as 'following_count' from twitter_followers where user_id=${user_id}`; 
      let following_count_result = await performQuery(following_count_query);
      if(following_count_result[0].following_count>0)
        data.following_count = following_count_result[0].following_count;
      else
        data.following_count=0;


      let follow_count_query = `select count(user_id) as 'follow_count' from twitter_followers where another_user_id=${user_id}`; 
      let follow_count_result = await performQuery(follow_count_query);
      if(follow_count_result[0].follow_count>0)
        data.follow_count = follow_count_result[0].follow_count;
      else
        data.follow_count=0;


      let following_list_query = `SELECT * FROM twitter_users as tu join twitter_followers as tf on tu.user_id=tf.user_id WHERE tu.user_id=${user_id}`; 
      let following_list_result = await performQuery(following_list_query);
      if(following_list_result.length>0)
        data.following_list = following_list_result;
      else
        data.following_list={};


      let follow_list_query = `SELECT * FROM twitter_users as tu join twitter_followers as tf on tu.user_id=tf.user_id WHERE tf.another_user_id=${user_id}`; 
      let follow_list_result = await performQuery(follow_list_query);
      if(follow_list_result.length>0)
        data.follow_list = follow_list_result;
      else
        data.follow_list={};

      data.status=true;
      res.send(data);
    } else{
      throw error;
    }
  } catch(error){
    res.send({"status":false});
  }

});


// let insert_sql_query_exp =
// `INSERT INTO work_exp_detail(id, company_name, designation, starting_date, leaveing_date) VALUES (` +
// `${basicId},'${companyName}','${desg}','${starting}','${ending}')`;
// let result = await performQuery(insert_sql_query_exp); 


app.listen(port, () =>{
  console.log(`app up on port ${port}`)
});