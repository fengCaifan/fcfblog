---
title: "实战02——blog项目01"
date: "2023-07-02"
category: "后端与 Go"
tags: ["Objective-C","网络与安全","Go","工程效率"]
description: "创建项目 先用 实战01——第一个小Gin项目 https://bhhbdrz3p9.feishu.cn/docx/HZ3pdvPHUoeS9Zx2PM9cqyuHnHe 的方案创建一个新的Demo 然后创建新的文件夹，"
feishu_token: "WG1Ed9Tw3otZeQxgCTMcoFvnnPh"
---

# 实战02——blog项目01

## 创建项目

先用[实战01——第一个小Gin项目](https://bhhbdrz3p9.feishu.cn/docx/HZ3pdvPHUoeS9Zx2PM9cqyuHnHe) 的方案创建一个新的Demo

然后创建新的文件夹，整理项目的文件。在项目根目录下创建对应的conf、docs、middleware、pkg、routers、runtime等文件夹

因为项目使用的是一个github的外部模块引用路径，而新建的模块还未push到远程，是没法远程下载下来的。所以需要在mod中添加replace，将对应远程的文件路径指定为本地的文件路径。（每新增一个文件夹，都应该这么做）注意右侧的本地路径是以项目根目录为基准的。

```go
replace (
    github.com/fcf/go-gin-example/pkg/setting => ./pkg/setting
    github.com/fcf/go-gin-example/conf => ./conf
    github.com/fcf/go-gin-example/middleware => ./middleware
    github.com/fcf/go-gin-example/models => ./models
    github.com/fcf/go-gin-example/routers => ./routers
    github.com/fcf/go-gin-example/runtime => ./runtime
    github.com/fcf/go-gin-example/docs => ./docs
)
```

## 创建数据库

在docs目录下创建一个blog.sql数据库。创建一些表。

- 注意：这个数据库名称blog，和我们安装好mysql后创建的database必须一样。使用create database blog。之后blog数据库下的这些表才能生效。

```sql

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `blog_auth`;
CREATE TABLE `blog_auth` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `username` varchar(50) DEFAULT '' COMMENT '账号',
    `password` varchar(50) DEFAULT '' COMMENT '密码',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2, DEFAULT CHARSET=utf8;
INSERT INTO `blog_auth` (`id`, `username`, `password`) VALUES ('1', 'test', 'test123');

-- 文章表
DROP TABLE IF EXISTS `blog_article`;
CREATE TABLE `blog_article` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `tag_id` int(10) unsigned DEFAULT '0' COMMENT '标签ID',
    `title` varchar(100) DEFAULT '' COMMENT '文章标题',
    `desc` varchar(255) DEFAULT '' COMMENT '简述',
    `content` text COMMENT '内容',
    `cover_image_url` varchar(255) DEFAULT '' COMMENT '封面图片地址',
    `created_on` int(10) unsigned DEFAULT '0' COMMENT '新建时间',
    `created_by` varchar(100) DEFAULT '' COMMENT '创建人',
    `modified_on` int(10) unsigned DEFAULT '0' COMMENT '修改时间',
    `modified_by` varchar(100) DEFAULT '' COMMENT '修改人',
    `deleted_on` int(10) unsigned DEFAULT '0',
    `state` tinyint(3) unsigned DEFAULT '1' COMMENT '删除时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT="文章管理";

-- // 标签表
DROP TABLE IF EXISTS `blog_tag`;
CREATE TABLE `blog_tag` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(100) DEFAULT '' COMMENT '标签名称',
    `created_on` int(10) unsigned DEFAULT '0' COMMENT '创建时间',
    `created_by` varchar(100) DEFAULT '' COMMENT '创建人',
    `modified_on` int(10) unsigned DEFAULT '0' COMMENT '修改时间'
    `modified_by` varchar(100) DEFAULT '' COMMENT '修改人',
    `deleted_on` int(10) unsigned DEFAULT '0',
    `state` tinyint(3) unsigned DEFAULT '1' COMMENT '状态0为禁用，1为启用',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEEFAULT CHARSET=utf8 COMMENT='文章标签管理';
```

## 使用go-ini编写项目配置

- 新建一个app.ini，输入如下内容
```go
#deubg or release

RUN_MODE = debug

[app]
PAGE_SIZE = 10
JWT_SECRET = 23347$040412
PrefixUrl = http://127.0.0.1:8000

[server]
HTTP_PORT = 8000
READ_TIMEOUT = 60
WRITE_TIMEOUT = 60

[database]
TYPE = mysql
USER = root
PASSWORD = 123456
HOST = 127.0.0.1:3306
NAME = blog
TABLE_PREFIX = blog_
```

  - 注意：这里database相关是访问mysql的相关配置。这里的user和password都是mysql使用时，mysql -u root -p中需要使用到的。

- 创建一个setting.go

```go
package setting

import (
    "log"
    "time"

    "github.com/go-ini/ini"
)

var (
    Cfg *ini.File

    RunMode string

    HTTPPort     int
    ReadTimeout  time.Duration
    WriteTimeout time.Duration

    PageSize  int
    JwtSecret string
)

func init() {
    var err error
    Cfg, err = ini.Load("conf/app.ini")
    if err != nil {
        log.Fatalf("Fail to pare 'conf/app.ini':%v", err)
    }

    LoadBase()
    LoadServer()
    LoadApp()
}

func LoadBase() {
    RunMode = Cfg.Section("").Key("RUN_MODE").MustString("debug")
}

func LoadServer() {
    sec, err := Cfg.GetSection("server")
    if err != nil {
        log.Fatalf("Fail to get section 'server':%v", err)
    }

    HTTPPort = sec.Key("HTTP_PORT").MustInt(8000)
    ReadTimeout = time.Duration(sec.Key("READ_TIMEOUT").MustInt(60)) * time.Second
    WriteTimeout = time.Duration(sec.Key("WRITE_TIMEOUT").MustInt(60)) * time.Second
}

func LoadApp() {
    sec, err := Cfg.GetSection("app")
    if err != nil {
        log.Fatalf("Fail to get section 'app':%v", err)
    }
    JwtSecret = sec.Key("JWT_SECRET").MustString("!@)*#)!@U#@*!@!)")
    PageSize = sec.Key("PAGE_SIZE").MustInt(10)
}
```

#### 编写API错误码包

在pkg文件夹下，建一个e文件夹（加入replace）。

创建一个错误码文件，code.go

```go
package e

const (
    SUCCESS        = 200
    ERROR          = 500
    INVALID_PARAMS = 400

    ERROR_EXIST_TAG         = 10001
    ERROR_NOT_EXIST_TAG     = 10002
    ERROR_NOT_EXIST_ARTICLE = 10003

    ERROR_AUTH_CHECK_TOKEN_FAIL    = 20001
    ERROR_AUTH_CHECK_TOKEN_TIMEOUT = 20002
    ERROR_AUTH_TOKEN               = 20003
    ERROR_AUTH                     = 20004
)
```

创建对应的msg.go

```go
package e

var MsgFlags = map[int]string{
    SUCCESS:        "ok",
    ERROR:          "fail",
    INVALID_PARAMS: "请求参数错误",

    ERROR_EXIST_TAG:         "已存在该标签名称",
    ERROR_NOT_EXIST_TAG:     "该标签不存在",
    ERROR_NOT_EXIST_ARTICLE: "该文章不存在",

    ERROR_AUTH_CHECK_TOKEN_FAIL:    "Token鉴权失败",
    ERROR_AUTH_CHECK_TOKEN_TIMEOUT: "Token已超时",
    ERROR_AUTH_TOKEN:               "Token生成失败",
    ERROR_AUTH:                     "Token错误",
}

func GetMsg(code int) string {
    msg, ok := MsgFlags[code]
    if ok {
        return msg
    }
    return MsgFlags[ERROR]
}
```

## 编写工具包

创建一个util目录。拉取unknwon/com依赖包

```bash
go get -u github.com/unknwon/com
```

#### 分页页码获取

在util目录下，创建一个pagination.go

```go
package util

import (
    "github.com/gin-gonic/gin"
    "github.com/unknwon/com"

    "github.com/fcf/go-gin-example/pkg/setting"
)

func GetPage(c *gin.Context) int {
    result := 0
    page, _ := com.StrTo(c.Query("page")).Int()
    if page > 0 {
        result = (page - 1) * setting.PageSize
    }
    return result
}
```

#### 编写models init

拉取gorm依赖包

```bash
go get -u github.com/jinzhu/gorm
```

拉取mysql驱动的依赖包

```bash
go get -u github.com/go-sql-driver/mysql
```

创建一个modes.go

```go
package models
    "log"

    "github.com/jinzhu/gorm"
    _ "github.com/jinzhu/gorm/dialects/mysql"

    "github.com/fcf/go-gin-example/pkg/setting"
)

var db *gorm.DB

type Model struct {
    ID         int `gorm:"primary_key" json:"id"`
    CreatedOn  int `json:"created_on"`
    ModifiedOn int `json:"modified_on"`
    DeletedOn  int `json:"deleted_on"`
}

func init() {
    fmt.Println("xxxxxxfcf: init models")
    var (
        err                                               error
        dbType, dbName, user, password, host, tablePrefix string
    )

    sec, err := setting.Cfg.GetSection("database")
    if err != nil {
        log.Fatal(2, "Fail to geet section 'database': %v", err)
        fmt.Println("xxxxxxfcf: GetSection falied")
    }
    dbType = sec.Key("TYPE").String()
    dbName = sec.Key("NAME").String()
    user = sec.Key("USER").String()
    password = sec.Key("PASSWORD").String()
    host = sec.Key("HOST").String()
    tablePrefix = sec.Key("TABLE_PREFIX").String()

    db, err = gorm.Open(dbType, fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8&parseTime=True&loc=Local",
        user,
        password,
        host,
        dbName))
    if err != nil {
        log.Println(err)
        fmt.Println("xxxxxxfcf: Open db falied")
    }

    gorm.DefaultTableNameHandler = func(db *gorm.DB, defaultTableName string) string {
        return tablePrefix + defaultTableName
    }

    db.SingularTable(true)
    db.LogMode(true)
    db.DB().SetMaxIdleConns(10)
    db.DB().SetMaxOpenConns(100)
}

func CloseDB() {
    fmt.Println("CloseDB")
    defer db.Close()
}
```

#### Router

在routers下创建一个router.go文件

```go
package routers

import (
    "github.com/fcf/go-gin-example/pkg/setting"
    "github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
    r := gin.New()

    r.Use(gin.Logger())
    r.Use(gin.Recovery())

    gin.SetMode(setting.RunMode)

    r.GET("/test", func(ctx *gin.Context) {
        ctx.JSON(200, gin.H{
            "message": "test",
        })
    })

    return r
}
```

## 启动项目

写一个main.go

```go
package main

import (
    "fmt"
    "net/http"

    "github.com/fcf/go-gin-example/pkg/setting"
    "github.com/fcf/go-gin-example/routers"
)

func main() {
    router := routers.InitRouter()
    
    s := &http.Server{
        Addr:           fmt.Sprintf(":%d", setting.HTTPPort),
        Handler:        router,
        ReadTimeout:    setting.ReadTimeout,
        WriteTimeout:   setting.WriteTimeout,
        MaxHeaderBytes: 1 << 20,
    }

    s.ListenAndServe()
}
```

## 知识点：

- **net/http** ：提供了HTTP客户端和服务端的实现

- Gin：
  - gin.Default()：返回Gin的type Engine struct{...}，
  - router.GET(...){...}：创建不同的HTTP方法绑定到handlers中

- github.com/go-ini/ini是Go语言的ini文件操作库。使得go项目能够应用INI配置文件。方便项目基础配置。

- jinzhu/gorm 是Go项目ORM架构。

- 学习from：[3.2 Gin搭建Blog API's （一）](https://eddycjy.gitbook.io/golang/di-3-ke-gin/api-01)

- 数据库mysql的使用的编写。[MySql的环境安装与用户权限](https://bhhbdrz3p9.feishu.cn/docx/Fud1dBaP5oPZR2xu0vOcSsGhngc) [mysql数据库操作](https://bhhbdrz3p9.feishu.cn/docx/Tol9dEkjOoCt9dxJ0LscN6vtnUb) 
  - 只有在数据库也启动的情况下，项目中关于数据库的操作才能生效。

- gorm使用：用于访问数据库。其次它还可以建立model与字符串之间的映射，对于数据库存取非常友好。


