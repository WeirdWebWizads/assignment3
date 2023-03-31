# assignment2
This root folder "assignment2" is equivalent as "p2" on UPF Server

## Dangerous Information
url --> https://ecv-etic.upf.edu/node/9036/

### REDIS Credentials
host: https://ecv-etic.upf.edu/_admin/php-redis-admin/

### MySql Credentials
https://ecv-etic.upf.edu/_admin/phpMyAdmin/ <br>
DB: "ecv-2019" <br>
User: "ecv-user" <br>
Pass: "ecv-upf-2019" <br>


### Database to store users

CREATE TABLE IF NOT EXISTS `www_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(256),
  `data` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `www_accounts` (`username`, `password`, `data`) VALUES ('test', 'test', '{}');
INSERT INTO `www_accounts` (`username`, `password`, `data`) VALUES ('test2', 'test', '{}');