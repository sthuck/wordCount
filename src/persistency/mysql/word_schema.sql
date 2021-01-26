create table word_count (
  `id` varchar(255) PRIMARY KEY,
  `count` bigint(8)  unsigned,
  INDEX (`count`)
 ) DEFAULT CHARSET=utf8;
