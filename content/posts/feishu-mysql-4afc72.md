---
title: "MySql的环境安装与用户权限"
date: "2023-06-03"
category: "后端与 Go"
tags: ["性能与稳定性","网络与安全","Go","MySQL"]
description: "安装 使用homebrew安装 碰到失败： 解决方案： 重新执行install mysql就成功了。 【Homebrew】Mac安装node报错_brew install node 报错_runzhliu的博客 CSDN"
feishu_token: "Fud1dBaP5oPZR2xu0vOcSsGhngc"
---

# MySql的环境安装与用户权限

## 安装

使用homebrew安装

```bash
$ brew install mysql
```

- 碰到失败：

```go
homebrew安装mysql报错：1.1-1.1.1s.monterey.bottle.tar.gz 
```

- 解决方案：

```bash
$ brew install libuv
```

重新执行install mysql就成功了。

[【Homebrew】Mac安装node报错_brew install node 报错_runzhliu的博客-CSDN博客](https://blog.csdn.net/oscarun/article/details/123178059)

验证mysql版本

```bash
mysql --version
```

## 基础配置

### 启动和关闭mysql服务

- 启动。需要输入**开机密码**
```go
& sudo mysql.server start
```

  - 如果报错： ... ERROR! The server quit without updating PID file (/usr/local/var/mysql/fengcaifandeMacBook-Pro-3.local.pid).
```bash
$ sudo chown -R _mysql /usr/local/var/mysql
```

  然后重启

```bash
$ sudo mysql.server restart
结果：
ERROR! MySQL server PID file could not be found!
Starting MySQL
.Logging to '/usr/local/var/mysql/fengcaifandeMacBook-Pro-3.local.err'.
...... SUCCESS!
```

- 关闭

```bash
$ sudo mysql.server stop
```

### 设置用户和权限

- 查看mysql安装路径:
```go
$ ps -ef|grep mysql
```

  - 这个命令也可以用来查看当前mysql是否启动。如果是启动状态会打印出mysql进程列表：
```go
$     0  4400     1   0 11:54上午 ttys002    0:00.03 /bin/sh /usr/local/Cellar/mysql/8.0.33/bin/mysqld_safe --datadir=/usr/local/var/mysql --pid-file=/usr/local/var/mysql/fengcaifandeMacBook-Pro-3.local.pid
   74  4496  4400   0 11:54上午 ttys002    0:15.49 /usr/local/Cellar/mysql/8.0.33/bin/mysqld --basedir=/usr/local/Cellar/mysql/8.0.33 --datadir=/usr/local/var/mysql --plugin-dir=/usr/local/Cellar/mysql/8.0.33/lib/plugin --user=mysql --log-error=fengcaifandeMacBook-Pro-3.local.err --pid-file=/usr/local/var/mysql/fengcaifandeMacBook-Pro-3.local.pid
  501  4944   554   0 12:35下午 ttys002    0:00.00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git --exclude-dir=.hg --exclude-dir=.svn mysql
```

  - 如果mysql已经关闭，会打印类似如下信息：
```go
501  4977   554   0 12:35下午 ttys002    0:00.00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git --exclude-dir=.hg --exclude-dir=.svn mysql
```

- 创建root 用户的密码

```go
$ mysqladmin -u root password "123456"
```

- 使用root 权限连接数据库

```bash
$ mysql -u root -p // 当前自己的密码是123456
```

到这就可以正常使用mysql了。

**总结**：

mysql的正常使用流程：

- 退出的话输入exit就行。

[Mac下brew安装mysql - 掘金](https://juejin.cn/post/7020737412955373598)

#### 添加用户

- 指定数据库：
```go
$ use mysql;
```

  - 操作数据库时，输入use mysql，表示当前用户开始使用mysql数据库。
  - 注意：只有root权限下才有mysql数据库，如果在新创的用户上：use mysql会报错。

- 创建了一个名为fcf，只能访问localhost的用户，密码是123456

```sql
$ create user 'fcf'@'localhost' identified with mysql_native_password by '123456';
```

查看用户列表

```bash
$ mysql> select user,host from user;

输出结果：
+------------------+-----------+
| user             | host      |
+------------------+-----------+
| root             | %         |
| fcf              | localhost |
| mysql.infoschema | localhost |
| mysql.session    | localhost |
| mysql.sys        | localhost |
+------------------+-----------+
5 rows in set (0.00 sec)
```

这个时候，可以退出当前用户的连接，使用新用户连接mysql

```bash
mysql -u fcf -p
```

[mysql8关于授权遇到的问题_mysql8 grant all privileges on *.* to 'root'@'%' i_llf_cloud的博客-CSDN博客oot'@'%' i_llf_cloud的博客-CSDN博客](https://blog.csdn.net/llf_cloud/article/details/83141338)

## 使用

- 查看当前指定数据库的所有列表（下面是在root用户下）：
```go
$ show databases;
输出结果：
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sso                |
| sys                |
+--------------------+
5 rows in set (0.00 sec)
```

- 

- 3、


