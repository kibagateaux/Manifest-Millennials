const express = require('express');
const app = express();
const mustacheExpress = require('mustache-express');

const pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL || 'postgres://00y@localhost:5432/mm');

const override = require('method-override');
const parser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');

const news = process.env.NEWSAPI;
const nyt = process.env.NYT;


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

const port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log(port, "vision");
});

const handlePostgresError = (err) => {
  console.log("Handle Error Triggered")
  console.log(err.code)
  switch(err.code){
    case "23505":
      return "Username is already taken."
    case "22012":
      return "YOU DIVIDED BY ZERO!!!! YOU HAVE DOOMED US ALL."
    case "23502":
      return "Please fill out all fields."
    case "23505":
      return "Your email and username must be unique."
    case "28000":
      return "You are not authorized"
    case "P0002":
      return "No data found, please try again later"
    case "22P02":
      return "Invalid input, please check that your information is correct"
    case "queryResultErrorCode.noData":
      return "Invalid email and password combination"
    default:
      return "There was an error, please try again"
  }
}

const handleJSError = (err) => {


}

app.get('/',function(req,res){
  user = req.session.user;
  res.render('index');
});

app.get('/logon', function(req, res){
  res.render('logon');
  console.log("server ready on port", port);
});

app.post('/logon', function(req,res){
  var data = req.body;
  console.log("Logon data")
  console.log(data.email, data.password);
    db.one(
    "SELECT * FROM users WHERE email = $1",
    [data.email]
    ).then(function(user){
      console.log(user);
      bcrypt.compare(data.password, user.hash, function(err, cmp){
          console.log(cmp)
          if(cmp){
            req.session.user = user;
            res.redirect('/posts');
            console.log("session has been created")
          } else { res.send("Invalid username/password combination") }
    });
  })
  .catch(err => handlePostgresError(err) );
});

app.post('/signup', function(req,res){
  // use ES6 deconstructing
  let {email, password, username, school, age} = req.body

  console.log(email, password, username, school);

  bcrypt.hash(password, 10, function(err, hash){
    db.none(
      "INSERT INTO users (username, hash, email, school, age) VALUES ($1, $2, $3, $4, $5)",
      [username, hash, email, school, age]
    )
    .catch(err => {

      console.log("Signup POST catch")
      console.log(handlePostgresError(err));
      res.send(handlePostgresError(err));

    })
    .then( res.redirect('/logon') )

 });
}); //ends POST request


app.get('/news', function(req,res){
  user = req.session.user;
  res.render('news', {'user': user});
});

app.post('/news', function(req,res){
  //save data to invisible form
  let news = req.body;
  let user = req.session.user;
  console.log(req.body);
  db.none("INSERT INTO articles(title, url, reader) VALUES ($1,$2, $3)",
    [news.title, news.url, user.id])
  .then(res.redirect('/news'));
});

app.get('/posts', function(req,res){
  let user = req.session.user;
  console.log("Session User from Posts")
  console.log(user);
  db.any(
   // "SELECT posts.id, ups, subject, body, user_name, posts.user_id, comment FROM posts,comments"
    // "SELECT * FROM posts INNER JOIN comments ON (post_id = posts.id) ORDER BY ups"
   //"SELECT posts.id, posts.user_id, users.id FROM posts JOIN users on posts.user_id = users.id"
   // "SELECT * FROM posts LEFT OUTER JOIN comments ON (comments.post_id = posts.id) LIMIT 5"
   "SELECT * FROM posts"
    ).then(function(data){

      (!session.user)? (isLoggedOut = true) : (isLoggedOut = false)
    let forum = {'forum': data, 'user': user, isLoggedOut: isLoggedOut};

    res.render('posts', forum);
  });
});

app.post('/posts', function(req,res){

  let user = req.session.user;
  let {subject, body} = req.body

  console.log(user)

  console.log(subject, body, user.username, user.id);

  db.none("INSERT INTO posts(subject, body, user_name, user_id) VALUES ($1,$2,$3,$4)",
    [subject, body, user.username, user.id])
  .then(function(){
      res.redirect('/posts');
    })
  .catch(function(err){
    res.send("You must be logged in and provide text in order to post")
    throw err;
  })
});

app.get('/posts/:id', function(req,res){
 let user = req.session.user;
 db.one(
  "SELECT * FROM posts WHERE id = $1",
  // "SELECT * FROM posts, comments WHERE posts.id, post_id = $1",
  // "SELECT * FROM posts INNER JOIN comments ON (post_id = $1 AND (posts.id = $1 OR posts.id = post_id))",
  // "SELECT * FROM posts, comments WHERE posts.id = $1 AND posts.id = post_id",
  // "SELECT * FROM posts, comments WHERE posts.id = $1 OR post_id = $1",
  [req.params.id]
  )
 .then(function(data){
  const post = data
  console.log(post);
  db.any(
    "SELECT * FROM comments WHERE post_id = $1",
    [post.id]
  ).then(function(comments){
    let data = {'post':post, 'user':user, 'comments':comments};
    console.log(data);
    res.render('post', data);
  })
 });
});

app.post('/posts/:id', function(req,res){
  let user = req.session.user;
  let subject = req.body.subject;
  let body = req.body.body;
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
  let user = req.session.user;
  db.any("SELECT * FROM posts INNER JOIN comments ON (post_id = posts.id) ORDER BY ups")
  .then(function(data){
    console.log(data);

    res.render('posts', {'forum': data, user: user});
  }).catch(function(err){
    console.log(err);
  })
});

app.post('/comment/:id', function(req,res){
  let user = req.session.user;
  let comment = req.body.comment;
  let post_id = req.params.id;
  console.log(comment, post_id);
  db.none("INSERT INTO comments(comment, post_id, user_id) VALUES ($1,$2,$3)",
    [comment, post_id, user.id])
  .then(function(){
    res.redirect('/posts')
  });
});


app.get('/users', function(req,res){
  res.send('You must log in to access your account buddy');
})

app.get('/users/:name', function(req,res){
    let user = req.session.user;
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
  let update = req.body;
  let user = req.session.user;
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



