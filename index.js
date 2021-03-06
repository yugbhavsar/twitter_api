const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const performQuery = require('./performQuery');
const axios = require('axios');
const url = require('url');
let jwt = require('jsonwebtoken');
const { verify } = require('crypto');
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


let genarateToken = (id)=>{
  const token = jwt.sign(
    {id},
    process.env.TOKEN_KEY,
    {
      expiresIn:"4h"
    }
  );
  return token; 
}


let verifyToken = (req,res,next)=>{
  const myToken = req.body.token || req.query.token;
  if(!myToken)
    return res.send(403).send({"status":false,"message":'token not received'});
  try{
    const decoded = jwt.verify(myToken,process.env.TOKEN_KEY);
    req.user=decoded;
  } catch(error){
    return res.status(401).send({"status":false,"message":'invalid token'});
  }
  return next();
}

app.get("/public/followFollowing/:user_id",async(req,res)=>{
  let user_id = req.params.user_id || null;
  let data = {};
  try{
    if(user_id){
      let following_count_query = `select count(follower_id) as 'following_count' from twitter_followers where user_id=${user_id}`; 
      let following_count_result = await performQuery(following_count_query);
      data.following_count = following_count_result[0].following_count;



      let follow_count_query = `select count(user_id) as 'follow_count' from twitter_followers where another_user_id=${user_id}`; 
      let follow_count_result = await performQuery(follow_count_query);
      data.follow_count = follow_count_result[0].follow_count;



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


app.get("/user/likeTweetManage/:tweet_id",verifyToken,async(req,res)=>{
  let tweet_id = req.params.tweet_id || null;

  let user_id=3;

  let data = {};
 
  try{
    let like_count_query = `SELECT count(like_id) as 'like_count' FROM twitter_likes WHERE uid=${user_id} and tweet_id=${tweet_id}`; 
    let like_count_result = await performQuery(like_count_query);
    if(like_count_result[0].like_count==0){
      let like_insert_query = `INSERT INTO twitter_likes(uid, tweet_id) VALUES (${user_id},${tweet_id})`; 
      await performQuery(like_insert_query);
    }else{
      let like_delete_query = `DELETE FROM twitter_likes WHERE tweet_id=${tweet_id} and uid=${user_id}`; 
      await performQuery(like_delete_query);
    }
    let after_like_count_query = `SELECT count(like_id) as 'tweet_like' FROM twitter_likes WHERE tweet_id=${tweet_id}`; 
    let after_like_count_result = await performQuery(after_like_count_query);
    data.tweet_like_count=after_like_count_result[0].tweet_like;
    data.status=true;
    res.send(data);
  } catch(error){
    res.send({"status":false});
  }  
});

app.post('/user/retweet/:tweet_id',verifyToken,async(req,res)=>{
  let tweet_id = req.params.tweet_id || null;
  
  let user_id=3;
  let tweet_content = "nice";
  let tweet_img = null;
  let data = {};
  try{
    let insert_tweet_query = `INSERT INTO twitter_tweets(user_id, tweet_text, image, parent_tweet_id) VALUES (${user_id},'${tweet_content}','${tweet_img}',${tweet_id})`; 
    let result = await performQuery(insert_tweet_query);
    data.tweet_id= result.insertId;
    data.status=true;
    res.send(data);
  } catch(error){
    res.send({"status":false});
  } 
});

app.post('/user/editTweet/:tweet_id',verifyToken,async(req,res)=>{
  let tweet_id = req.params.tweet_id || null;
  
  let user_id=3;
  let tweet_content = "nice";
  let tweet_img = null;
  let data = {};
  try{
    let update_tweet_query = `UPDATE twitter_tweets SET tweet_text='${tweet_content}',image='${tweet_img}' WHERE user_id=${user_id} and tweet_id=${tweet_id}`; 
    await performQuery(update_tweet_query);
    data.status=true;
    res.send(data);
  } catch(error){
    res.send({"status":false});
  } 
});

app.get('/public/comments/:tweet_id',async(req,res)=>{
  let tweet_id = req.params.tweet_id || null;
  let data = {};
  try{
    let tweet_comments_query = `SELECT * FROM twitter_comments WHERE tweet_id=${tweet_id}`; 
    let tweet_comments_result = await performQuery(tweet_comments_query);
    data.comments = tweet_comments_result;
    data.status=true;
    res.send(data);
  } catch(error){
    res.send({"status":false});
  } 
});

// ?username=""
app.get('/public/searchProfile',async(req,res)=>{
  let username = req.query.username || null;
  
  let data = {};
  try{
    let profile_query = `SELECT * FROM twitter_users WHERE username like '${username}%'`; 
    let profile_result = await performQuery(profile_query);
    data.profiles = profile_result;
    data.status=true;
    res.send(data);
  } catch(error){
    res.send({"status":false});
  } 
});

app.get('/user/deActivateAccount/:user_id',verifyToken,async(req,res)=>{
  let user_id = req.params.user_id || null;
  
  let data = {};
  try{
    let profile_deactiveate_query = `UPDATE twitter_users SET is_active=0 WHERE user_id=${user_id}`; 
    await performQuery(profile_deactiveate_query);
    data.status=true;
    res.send(data);
  } catch(error){
    res.send({"status":false});
  } 
});

app.get('/user/deleteAccount/:user_id',verifyToken,async(req,res)=>{
  let user_id = req.params.user_id || null;
  let data = {};
  try{
    let profile_delete_query = `UPDATE twitter_users SET is_active=0, is_deleted=1 WHERE user_id=${user_id}`; 
    await performQuery(profile_delete_query);
    data.status=true;
    res.send(data);
  } catch(error){
    res.send({"status":false});
  } 
});


app.get("/public/allTweets",async(req,res)=>{
  data={};
  try{
    let all_tweet_query = `SELECT * FROM twitter_tweets`; 
    let all_tweet_result = await performQuery(all_tweet_query);
    data.tweets = all_tweet_result;

    for(let i=0;i<all_tweet_result.length;i++){
      let tweet_id = all_tweet_result[i].tweet_id;
      let reTweetCount_query = `SELECT count(tweet_id) as retweet_count FROM twitter_tweets where parent_tweet_id=${tweet_id}`; 
      let reTweetCount_result = await performQuery(reTweetCount_query);
      data.tweets[i].retweet_count = reTweetCount_result[0].retweet_count;
    }

   
    data.tweets = all_tweet_result;
    data.status = true;
    res.send(data);
  } catch(error){
    res.send({"status":false});
  }

});

app.post("/user/comment/:tweet_id",verifyToken, async (req, res) => {

  // let comment= req.query.comment;
  let tweet_id = req.params.tweet_id || null;
  let comment = "first commnet"

  let user_id = 5;
  let data = {};

  try {
    let comment_query = `INSERT INTO twitter_comments( tweet_id, comment, user_id) VALUES (${tweet_id},'${comment}',${user_id})`

    let result = await performQuery(comment_query);
    data.comment_id = result.insertId;
    data.status = true;
    res.send(data)

  } catch (err) {
    res.send({ "status": false });
  }

});




app.post("/user/updateComment/:comment_id",verifyToken, async (req, res) => {
  let comment_id = req.params.comment_id || null;

  let comment = "first commentssss ";

  let data = {};

  try {
    let update_comment_query = `UPDATE twitter_comments SET comment='${comment}' WHERE comment_id=${comment_id} `
    await performQuery(update_comment_query)


    data.status = true;

    res.send(data)


  } catch (err) {
    res.send({ "status": false });
  }


});


app.get("/user/deleteComment/:comment_id",verifyToken, async (req, res) => {
  let comment_id = req.params.comment_id || null;
  let data = {};

  try {
    let delete_comment_query = `DELETE FROM twitter_comments WHERE comment_id=${comment_id} `
    await performQuery(delete_comment_query)


    data.status = true;

    res.send(data)


  } catch (err) {
    res.send({ "status": false });
  }


});

// let insert_sql_query_exp =
// `INSERT INTO work_exp_detail(id, company_name, designation, starting_date, leaveing_date) VALUES (` +
// `${basicId},'${companyName}','${desg}','${starting}','${ending}')`;
// let result = await performQuery(insert_sql_query_exp); 


app.listen(port, () =>{
  console.log(`app up on port ${port}`)
});
