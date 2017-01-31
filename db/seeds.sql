INSERT INTO users(username, hash, email, school, ups) VALUES ('a', 'a', 'a', 'a', 4);
INSERT INTO users(username, hash, email, school, ups) VALUES ('b', 'b', 'b', 'b', 12);
INSERT INTO posts(subject, body, ups, user_name, user_id) VALUES ('Crippling ear drums', 'How do I stop these voices', 2, 'a', 1);
INSERT INTO posts(subject, body, ups, user_name, user_id) VALUES ('The economic conditions of the proletariat are entirely acceptable', 'How do I stop these voices', 9, 'a', 1);
INSERT INTO posts(subject, body, ups, user_name, user_id) VALUES ('📺⛩📷💎', '🏄🏿🏸', 2, 'a', 1);
INSERT INTO comments(comment, post_id, user_id) VALUES ('that"s sick', 2, 1);
INSERT INTO comments(comment, post_id, user_id) VALUES ('lade dah', 1, 2);
INSERT INTO comments(comment, post_id, user_id) VALUES ('blah blah', 1, 1);
INSERT INTO comments(comment, post_id, user_id) VALUES ('hahaha hahha', 3, 2);

--INSERT INTO user (id, name, username, opted_in)
--  SELECT id, name, username, opted_in
--  FROM user LEFT JOIN user_permission AS userPerm ON user.id = userPerm.user_id
--OR
-- CREATE TRIGGER creat_perms AFTER INSERT ON `user`
-- FOR EACH ROW
-- BEGIN
--   INSERT INTO user_permission (user_id, permission_id) VALUES (NEW.id, 4)
-- END
