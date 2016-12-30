var express = require('express');
var app = express();
var mustacheExpress = require('mustache-express');

var pgp = require('pg-promise')();
var db = pgp(process.env.DATABASE_URL || 'postgres://00y@localhost:5432/mm');

var override = require('method-override');
var parser = require('body-parser');
var session = require('express-session');
var bcrypt = require('bcryptjs');
var fetch = require('node-fetch');

var news = process.env.NEWSAPI;
var nyt = process.env.NYT;


app.use('/', express.static(__dirname+'/public'));
app.set('views',__dirname+'/views');
app.engine('html', mustacheExpress());
app.set('view engine','html');
app.use (override('_method'));
app.use(parser.urlencoded({extended: false}));
app.use(parser.json());

app.use(session({
  secret: 'theTruthIsOutThere51',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log(port, "vision");
});


app.get('/',function(req,res){
  user = req.session.user;
  res.redirect('/posts');
});

app.get('/logon', function(req, res){
  res.render('logon');
  console.log("server ready on port", port);
});

app.post('/logon', function(req,res){
  var data = req.body;
  console.log(data.email, data.password);
    db.one(
    "SELECT * FROM users WHERE email = $1",
    [data.email]
    ).catch(function(){
      res.send("User request could not be completed");
    }).then(function(user){
      console.log(user);
      bcrypt.compare(data.password, user.hash, function(err, cmp){
          if(cmp){
            req.session.user = user;
            res.redirect('/posts');
          } else {
            res.send("User request could not be completed");
          }
    });
  });
});

app.post('/signup', function(req,res){

  var data = req.body;
  var email = data.email;
  var password = data.password;
  var username = data.username;
  var school = data.school;
  //use ES6 deconstructing
  //{email, password, username, school} = req.body
  console.log(email, password, username, school);

  bcrypt.hash(password, 10, function(err, hash){
    db.none(
      "INSERT INTO users (username, hash, email, school) VALUES ($1, $2, $3, $4)",
      [username, hash, email, school]
    )
    .then(function(){
      res.render('logon');
    });
  }); //ends Bcrypt
}); //ends POST request


app.get('/news', function(req,res){
  user = req.session.user;
  res.render('news', {'user': user});
});

app.post('/news', function(req,res){
  //save data to invisible form
  news = req.body;
  user = req.session.user;
  console.log(req.body);
  db.none("INSERT INTO articles(title, url, reader) VALUES ($1,$2, 1)",
    [news.title, news.url])
  .then(res.redirect('/news'));
});

app.get('/posts', function(req,res){
  var user = req.session.user;
  console.log(user);
  db.any(
   // "SELECT posts.id, ups, subject, body, user_name, posts.user_id, comment FROM posts,comments"
   // "SELECT * FROM posts INNER JOIN comments ON (posts.id = post_id)"
   //"SELECT posts.id, posts.user_id, users.id FROM posts JOIN users on posts.user_id = users.id"
   "SELECT * FROM posts LEFT OUTER JOIN comments ON (comments.post_id = posts.id) LIMIT 5"
   // "SELECT * FROM posts"
    ).then(function(data){
      console.log(data);
    var forum = {'forum': data, 'user': user};
    res.render('posts', forum);
  });
});

app.post('/posts', function(req,res){

  var user = req.session.user;
  var subject = req.body.subject;
  var body = req.body.body;
  var username = req.body.username;

  console.log(subject, body, username, user.id);

  db.none("INSERT INTO posts(subject, body, user_name, user_id) VALUES ($1,$2,$3,$4)",
    [subject, body, username, user.id])
  .then(function(){
    db.many("SELECT * FROM posts LEFT OUTER JOIN comments ON (post_id = posts.id)")
    .then(function(data){
      res.render('posts', {'forum': data});
    });
  })
  .error(function(err){
    throw err;
  })
});

app.get('/posts/:id',function(req,res){
 var user = req.session.user;
 db.any(
  "SELECT * FROM posts, comments WHERE posts.id, post_id = $1",
  // "SELECT * FROM posts, comments WHERE posts.id = $1 AND posts.id = post_id",
  // "SELECT * FROM posts, comments WHERE posts.id = $1 OR post_id = $1",
  [req.params.id]
  )
 .then(function(data){
  res.render('posts', {'forum':data, 'user':user});
 });
});

app.post('/posts/:id', function(req,res){
  var user = req.session.user;
  var subject = req.body.subject;
  var body = req.body.body;
  console.log(subject, body);

  db.none("INSERT INTO posts(subject, body, user_id) VALUES ($1,$2,$3)",
    [subject, body, user.id])
    .then(function(){
      res.render('posts');
    })
    .catch(function(req,res){
      res.send("You must log on in order to posy, my friend");
    });
  //add completion alert
});

app.get('/top-posts', function(req, res){
  var user = req.session.user;
  db.any("SELECT * FROM posts INNER JOIN comments ON (post_id = posts.id) ORDER BY ups ASC")
  .then(function(data){
    console.log(data);
    // res.render('top', {'post': data});
    res.render('posts', {'forum': data});
  }).catch(function(e){
    console.log(e);
  })
});

app.post('/comment/:id', function(req,res){
  var user = req.session.user;
  var comment = req.body.comment;
  var post_id = req.params.id;
  console.log(comment, post_id);
  db.none("INSERT INTO comments(body, post_id, user_id) VALUES ($1,$2,$3)",
    [comment, post_id, user.id])
  .then(function(){
    res.redirect('/posts')
  });
});


app.get('/users', function(req,res){
  res.send('You must log in to access your account buddy');
})

app.get('/users/:name', function(req,res){
    var user = req.session.user;
    db.any("SELECT * FROM posts WHERE user_name = $1",
      [req.params.name]
    )
    // .catch(function(){
    //   res.send("YOU MUST LOG ON TO ACCESS YOUR PROFILE");
    // })
    .then(function(data){
      console.log(data);
      res.render('users/show', {'data': data, 'user': user});
    });
});

// .update?
app.put('/users/:name', function(req,res){
  var update = req.body;
  var user = req.session.user;
  bcrypt.hash(update.password, 10, function(err, hash){
    db.none(
     "UPDATE users SET username=$1, hash=$2, email=$3, school=$4 WHERE username = $5",
    [update.username, hash, update.email, update.school, req.params.name]
    )
  .then(function(){
    res.redirect('/user/'+ user.id);
    })
  });
});

app.delete('/users/:name', function(req,res){
  console.log("user deleted");
  db.one("DELETE FROM users,posts WHERE (users.id=$1 OR posts.users_id = $1)",
    [req.params.name])
    .then(function(user){
      console.log(user);
      res.redirect('/posts')
    });
});



