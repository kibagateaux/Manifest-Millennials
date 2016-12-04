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
}))

var sources = [
    'bloomberg',
    'ars-technica',
    'hacker-news',
    'recode',
    'the-wall-street-journal'
    ];

 var fetchArr = sources.map(function(a){
    var query = 'https://newsapi.org/v1/articles?source='
      + a +
      '&sortBy=top&apiKey=' + news +'&format=json';
    return (
      fetch(query)
      .then(function(res){
      return res.json()}) //brilliance by Tims
    );
});
var sourceData;

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log(port, "vision");
});


app.get('/',function(req,res){
  user = req.session.user
  res.render('index', {'user': user});
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
      res.send("User request could not be completed")
    }).then(function(user){
      console.log(user);
      bcrypt.compare(data.password, user.hash, function(err, cmp){
          if(cmp){
            req.session.user = user;
            res.redirect('/posts');
          } else {
            res.send("User request could not be completed")
          }
        })
  });
});

app.post('/signup', function(req,res){
  var data = req.body;
  var email = req.body.email;
  var password = req.body.password;
  var username = req.body.username;
  var school = req.body.school;

  console.log(email, password, username, school);

  bcrypt.hash(data.password, 10, function(err, hash){
    db.none(
      "INSERT INTO users (username, hash, email, school) VALUES ($1, $2, $3, $4)",
      [username, hash, email, school]
    ).then(function(){
      db.any("SELECT posts.id, posts.ups, subject, body, username, users.id FROM posts,users")
    .then(function(data){
      var forum = {'data': data};
      res.render('logon')
      })
    });
  });


})

var response;

app.get('/news', function(req,res){
// fetch("https://api.nytimes.com/svc/mostpopular/v2/mostviewed//.json/?api-key="+nyt)
//   .then(function(data){
//     console.log(data);
//     res.send(data);
//   })
// Promise.all(fetchArr).then(function(result){

//   var response = result.map(function(a){
//   var art = a.articles;

//     for (var i = 0; i<a.articles.length; i++){

//         var news = {'source': a.source,
//                     'title': art[i].title,
//                     'url': art[i].url,
//                     'desc': art[i].description,
//                     'image': art[i].urlToImage};
//     }
//     return news;
//   });
//   return response
//     // res.render('news', {'data': response[0]});
//   })
// .then(function(response){
//     console.log("Data sent to /news");
//     console.log(response);
  // res.render('news', {'data':response});
  user = req.session.user;
  res.render('news', {'user': user})
// })
});

app.post('/news', function(req,res){
  //save data to invisible form
  news = req.body;
  user = req.session.user;
  console.log(req.body);

  db.none("INSERT INTO articles(title, url, reader) VALUES ($1,$2, 1)",
    [news.title, news.url])
  .then(res.redirect('/news'))

})


app.get('/posts', function(req,res){
  var user = req.session.user;

  console.log(user);
  db.many(
   // "SELECT posts.id, posts.ups, subject, body, username, users.id FROM posts,users"
   //"SELECT posts.id, posts.user_id, users.id FROM posts JOIN users on posts.user_id = users.id"
   "SELECT * FROM posts LEFT OUTER JOIN comments ON (post_id = posts.id)"
    ).then(function(data){
      console.log(data)
    var forum = {'forum': data, 'user': user};
    console.log("forum post id search", forum);
    res.render('forum', forum);
  //   db.any("SELECT * FROM comments WHERE post_id = $1", [forum.data.id])
  // .then(function(comment, forum){
  //    console.log("POST ID SEARCH", data);
  //    res.render('forum', {'comments': comment, 'forum': forum});
  // db.any("SELECT * FROM posts FULL OUTER JOIN users ON(posts.user_id = users.id)")
  // db.any("SELECT * FROM users LEFT OUTER JOIN posts ON(posts.user_id = users.id)")
    // });
  });
});

app.post('/posts', function(req,res){
  var user = req.session.user;
  var subject = req.body.subject;
  var body = req.body.body;
  var username = req.body.username
  console.log(subject, body);
  db.none("INSERT INTO posts(subject, body, username, user_id) VALUES ($1,$2,$3,$4)",
    [subject, body, username, user.id])
  .catch(function(req,res){
      res.send("You must log on in order to post, my friend");
    })
  .then(function(){
    db.many("SELECT * FROM posts LEFT OUTER JOIN comments ON (post_id = posts.id)")
    .then(function(data){
      res.render('forum', {'forum': data});
    })
  })
})

app.post('/posts/:id', function(req,res){
  var user = req.session.user;
  var subject = req.body.subject;
  var body = req.body.body;
  console.log(subject, body);

   //How to decide between post and comment?
  db.none("INSERT INTO posts(subject, body, user_id) VALUES ($1,$2,$3)",
    [subject, body, user.id]).then(function(){
      res.render('forum');
    }).catch(function(req,res){
      res.send("You must log on in order to posy, my friend");
    });
  //completion alert?
});

app.get('/top-posts', function(req, res){
  var user = req.session.user;
  db.any("SELECT * FROM posts INNER JOIN comments ON (post_id = posts.id) ORDER BY ups ASC")
  .then(function(data){
    console.log(data);
    // res.render('top', {'post': data});
    res.render('forum', {'forum': data});
  }).catch(function(e){
    console.log(e);
  })
});


/* Change :post to :id */
app.post('/comment/:id', function(req,res){
  var user = req.session.user;
  var comment = req.body.comment;
  var post_id = req.params.id;
  console.log(comment, post_id);
  db.none("INSERT INTO comments(body, post_id, user_id) VALUES ($1,$2,$3)",
    [comment, post_id, user.id])
  .then(function(){res.redirect('/posts')});
});

app.get('/user', function(req,res){
  res.send('You must log in to access your account buddy');
})


app.get('/user/:id', function(req,res){
    var user = req.session.user;
    db.any("SELECT * FROM posts WHERE user_id = 1"
      // [user.id]
    ).catch(function(){
      res.send("YOU MUST LOG ON TO ACCESS YOUR PROFILE");
    })
    .then(function(data){
      res.render('profile', {'data': data, 'user': user});
    })

});

app.put('/user/:id', function(req,res){
  const update = req.body;
  var user = req.session.user;
  bcrypt.hash(update.password, 10, function(err, hash){
    db.none(
     "UPDATE users SET username=$1, hash=$2, email=$3, school=$4 WHERE id = $5",
    [update.username, hash, update.email, update.school, req.params.id]
    )
  .then(function(){
    res.redirect('/user/'+user.id);
    })
  });
});

app.delete('/user/:id', function(req,res){
  console.log("user deleted");
  db.one("DELETE FROM users,posts WHERE (users.id=$1 OR posts.users_id = $1)",
    [req.params.id])
    .then(function(user){
      console.log(user);
      res.redirect('/posts')
    });
});



