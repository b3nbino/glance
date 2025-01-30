CREATE TABLE users(
  username varchar(30) PRIMARY KEY,
  password text NOT NULL
);

CREATE TABLE posts(
  id serial PRIMARY KEY,
  content char(256) NOT NULL,
  date_created timestamp DEFAULT CURRENT_TIMESTAMP,
  username text NOT NULL REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE comments(
  id serial PRIMARY KEY,
  post_id integer REFERENCES posts(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  date_created timestamp DEFAULT CURRENT_TIMESTAMP,
  username text NOT NULL REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE tags(
  tag_name varchar(25) PRIMARY KEY
);

CREATE TABLE posts_tags(
  id serial PRIMARY KEY,
  post_id integer NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_name text NOT NULL REFERENCES tags(tag_name) ON DELETE CASCADE
);