 create table job_status (
  `id` varchar(36) PRIMARY KEY,
  `status` tinyint  unsigned,
  `reason` mediumtext
 ) DEFAULT CHARSET=utf8;