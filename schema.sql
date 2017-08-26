/*  Execute this file from the command line by typing:
 *    mysql -u <USER> < schema.sql
 *    OR
 *    mysql -u <USER> -p < schema.sql
 *  On your personal computer, if you haven't set up
 *  a password, it'll be
 *    mysql -u <USER> < schema.sql
*/

DROP DATABASE IF EXISTS pass_database;

CREATE DATABASE pass_database;

USE pass_database;

CREATE TABLE users (
  id int PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(50) UNIQUE,
  password VARCHAR(100),
  salt VARCHAR(10),
  fb_id VARCHAR(50),
  fb_accessToken VARCHAR(200),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  rating int,
  review_count int,
  customer_id VARCHAR(30) UNIQUE,
  merchant_id VARCHAR(30) UNIQUE
  );

CREATE TABLE sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL UNIQUE,
    expires INT(11) unsigned NOT NULL,
    data TEXT COLLATE utf8mb4_bin,
    user_id int,
    PRIMARY KEY (session_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  ) ENGINE=InnoDB;

CREATE TABLE reviews (
  id int PRIMARY KEY AUTO_INCREMENT,
  review_receiver_id int,
  review_giver_id int,
  transaction_type VARCHAR(15),
  rating_given DECIMAL(2,1),
  comment_text VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (review_receiver_id) REFERENCES users(id),
  FOREIGN KEY (review_giver_id) REFERENCES users(id)
);

CREATE TABLE messages (
    id int PRIMARY KEY AUTO_INCREMENT,
    sender_id int,
    reciever_id int,
    time_sent DATETIME,
    text VARCHAR(255),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (reciever_id) REFERENCES users(id)
  );

CREATE TABLE sold_passes (
    id int PRIMARY KEY AUTO_INCREMENT,
    seller_id int,
    buyer_id int,
    notes VARCHAR(255),
    sell_date DATE,
    expiration_date DATE,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id)
  );

CREATE TABLE for_sale_block (
  id int PRIMARY KEY AUTO_INCREMENT,
  pass_volume int,
  seller_id int,
  current_price DECIMAL(5,2),
  period_start DATE,
  period_end DATE,
  passes_sold int,
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE sold_passes (
    id int PRIMARY KEY AUTO_INCREMENT,
    seller_id int,
    buyer_id int,
    notes VARCHAR(255),
    sell_date DATE,
    for_sale_block_id int,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (for_sale_block_id) REFERENCES for_sale_block(id)
  );

CREATE TABLE restricted_list (
    id int PRIMARY KEY AUTO_INCREMENT,
    studio VARCHAR(100),
    for_sale_block_id int,
    FOREIGN KEY (for_sale_block_id) REFERENCES for_sale_block(id)
  );

CREATE TABLE restricted_studios (
    block_id int,
    exempt_studio_id int,
    FOREIGN KEY (block_id) REFERENCES for_sale_block(id),
    FOREIGN KEY (exempt_studio_id) REFERENCES restricted_list(id)
  );

CREATE TABLE pending_passes (
  id int PRIMARY KEY AUTO_INCREMENT,
  perspective_buyer_id int,
  for_sale_block_id int,
  purchased VARCHAR(20),
  FOREIGN KEY (perspective_buyer_id) REFERENCES users(id),
  FOREIGN KEY (for_sale_block_id) REFERENCES for_sale_block(id)
);

CREATE TABLE payment_options (
  id int PRIMARY KEY AUTO_INCREMENT,
  user int,
  numberHash VARCHAR(255) NOT NULL UNIQUE,
  expDate date NOT NULL,
  csv int,
  FOREIGN KEY (user) REFERENCES users(id)
);

INSERT INTO users (id, email, password, salt, first_name, last_name, phone, created_at, updated_at, rating, review_count) VALUES
  (1, 'billy@bob.com', SHA2('billysPasswordcPjfn67sdv', 0), 'cPjfn67sdv', 'Billy', 'Bob', '5208184579', '2017-03-05', '2017-03-09', 4, 4),
  (2, 'sally@sal.com', SHA2('sallysPassword8nJHBh665v', 0), '8nJHBh665v', 'Sally', 'Sal', '1112224444', '2017-04-15', NULL,3,10),
  (3, 'david45@gmail.com', SHA2('davidsPasswordvByt76912s', 0), 'vByt76912s', 'David', 'Drummer', '9998887777', '2017-06-09', NULL, 4.5, 20);

INSERT INTO reviews (review_receiver_id, review_giver_id, transaction_type, rating_given, comment_text, created_at, updated_at) VALUES
  (2, 1, 'sale', 5.0, 'Amazing person to work with!', '2017-02-01', '2017-04-03'),
  (3, 1, 'conversation', 2.4, 'Avoid them. They are super flaky.', '2017-04-21', NULL);

INSERT INTO for_sale_block (id, pass_volume, seller_id, current_price, period_start, period_end, passes_sold) VALUES
  (1, 15, 2, 8.90, '2017-04-11', '2017-04-30', 4),
  (2, 9, 2, 9.00, '2017-05-03', '2017-06-01', 1),
  (3, 11, 1, 10.00, '2017-03-03', '2017-03-15', 1),
  (4, 9, 1, 9.25, '2017-04-01', '2017-04-19', 1),
  (5, 9, 1, 8.99, '2017-04-20', '2017-04-30', 5);

INSERT INTO messages (sender_id, reciever_id, time_sent, text) VALUES
  (1, 2,'2017-05-06 11:12:13', 'Hi, how are you doing?'),
  (2, 1, '2017-05-06 11:12:45', 'I\'m great! Do you have class passes?'),
  (1, 2, '2017-05-06 11:13:40', 'Absolutely!'),
  (3, 2, '2017-02-05 15:40:01', 'I\'d like to buy passes from you.');

INSERT INTO sold_passes (seller_id, buyer_id, notes, sell_date, for_sale_block_id) VALUES
  (1, 2, 'Easy to work with', '2017-02-05', 2),
  (3, 2, NULL, '2017-07-12', 1);

INSERT INTO restricted_list (id, studio, for_sale_block_id) VALUES
  (1, 'C.C. Cycling', 2),
  (2, 'Edmond Climbing', 1),
  (3, 'Edmond Climbing', 2),
  (4, 'Gold Gym', 1),
  (5, 'none', 5);

INSERT INTO restricted_studios (block_id, exempt_studio_id)
  VALUES (1, 1), (1, 3), (2, 3), (3, 2), (3, 4), (5, 2);
