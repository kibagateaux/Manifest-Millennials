DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reactions;

-- Add "tone" to posts
-- Posts have reactions, from other users
-- tone and reactions have same values,

CREATE TABLE users(
  id serial PRIMARY KEY,
  username varchar(50) UNIQUE NOT NULL,
  hash varchar(255) NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  school varchar(100) NOT NULL,
  ups integer
);

CREATE TABLE posts(
  id serial PRIMARY KEY,
  subject varchar(255),
  body varchar(255) NOT NULL,
  tone varchar(25),
  ups integer,
  user_name varchar(50) NOT NULL,
  user_id integer REFERENCES users (id) NOT NULL,
  stalk_id integer REFERENCES posts,
  reaction integer REFERENCES reactions
);


CREATE TABLE comments(
  id serial PRIMARY KEY,
  comment varchar(255) NOT NULL,
  user_id integer REFERENCES users NOT NULL,
  post_id integer REFERENCES posts NOT NULL
);

CREATE TABLE reactions(
  id serial PRIMARY KEY,
  happy integer,
  inspiring integer,
  funny integer,
  sad integer,
  fear integer,
  thoughtful integer,
  post_id REFERENCES posts NOT NULL
);

CREATE TABLE tags(
  id serial PRIMARY KEY,
  tag varchar(20),
  post_id integer REFERENCES posts
);

CREATE TABLE articles(
  id serial PRIMARY KEY,
  title varchar(255),
  url varchar(255),
  reader integer REFERENCES users
)
