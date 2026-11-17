---
title: "实战05—— blog项目04"
date: "2023-07-02"
category: "后端与 Go"
tags: ["网络与安全","Go","工程效率"]
description: "实战02——blog项目01 https://bhhbdrz3p9.feishu.cn/docx/WG1Ed9Tw3otZeQxgCTMcoFvnnPh 中创建了blog项目的基础框架。 实战03——blog项目02 h"
feishu_token: "S5WFd17Y2oBjwTxf1k8cUXB4n6g"
---

# 实战05—— blog项目04

[实战02——blog项目01](https://bhhbdrz3p9.feishu.cn/docx/WG1Ed9Tw3otZeQxgCTMcoFvnnPh) 中创建了blog项目的基础框架。

[实战03——blog项目02](https://bhhbdrz3p9.feishu.cn/docx/HSAVdHEbcoRE5pxwwDqci8DGn4b) 将Blog标签类接口的开发完成。

[实战04——blog项目03](https://bhhbdrz3p9.feishu.cn/docx/EtKddbXVwoAcmxxYeGgc0GlPnjf) 完成了文章类接口的开发工作。

这节的目标是使用JWT，处理用户登录注册，避免任意访问的问题

## 编写jwt工具包

- 下载jwt-go依赖包

```bash
$ go get -u github.com/dgrijalva/jwt-go
```

- 在pkg下的util目录下新建jwt.go工具包

```go
package util

import (
    "time"

    "github.com/fcf/go-gin-example/pkg/setting"

    jwt "github.com/dgrijalva/jwt-go"
)

var jwtSecret = []byte(setting.JwtSecret)

type Claims struct {
    Username string `json:"username"`
    Password string `json:"password"`
    jwt.StandardClaims
}

// 生成Token
func GenerateToken(username, password string) (string, error) {
    nowTime := time.Now()

    expireTime := nowTime.Add(3 * time.Hour)

    claims := Claims{
        username,
        password,
        jwt.StandardClaims{
            ExpiresAt: expireTime.Unix(),
            Issuer:    "gin-blog",
        },
    }

    tokenClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, claims) // hash算法
    token, err := tokenClaims.SignedString(jwtSecret)                // 生成签名字符串
    return token, err
}

// 解析token
func ParseToken(token string) (*Claims, error) {
    // 对token进行解码和校验
    tokenClaims, err := jwt.ParseWithClaims(token, &Claims{}, func(t *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })

    if tokenClaims != nil {
        if claims, ok := tokenClaims.Claims.(*Claims); ok && tokenClaims.Valid {
            return claims, nil
        }
    }
    return nil, err
}
```

- 编写gin的jwt中间件。在middleware下新建jwt目录，创建一个jwt.go

```go
package jwt

import (
    "net/http"
    "time"

    "github.com/fcf/go-gin-example/pkg/e"
    "github.com/fcf/go-gin-example/pkg/util"
    "github.com/gin-gonic/gin"
)

func JWT() gin.HandlerFunc {
    return func(ctx *gin.Context) {
        var code int
        var data interface{}

        code = e.SUCCESS
        token := ctx.Query("token")
        if token == "" {
            code = e.ERROR_NOT_TOKEN
        } else {
            claims, err := util.ParseToken(token)
            if err != nil {
                code = e.ERROR_AUTH_CHECK_TOKEN_FAIL
            } else if time.Now().Unix() > claims.ExpiresAt {
                code = e.ERROR_AUTH_CHECK_TOKEN_TIMEOUT
            }
        }

        if code != e.SUCCESS {
            ctx.JSON(http.StatusUnauthorized, gin.H{
                "code": code,
                "msg":  e.GetMsg(code),
                "data": data,
            })

            ctx.Abort()
            return
        }

        ctx.Next()
    }
}
```

#### 如何获取Token

- 在models下新建auth.go文件

```go
package models

type Auth struct {
    ID       int    `gorm:"primary_key" json:"id"`
    Username string `json:"username"`
    Password string `json:"password"`
}

func CheckAuth(username, password string) bool {
    var auth Auth
    db.Select("id").Where(Auth{Username: username, Password: password}).First(&auth)
    return auth.ID > 0
}
```

- 在router下api目录里新建auth.go文件

```go
package api

import (
    "fmt"
    "log"
    "net/http"

    "github.com/astaxie/beego/validation"
    "github.com/fcf/go-gin-example/models"
    "github.com/fcf/go-gin-example/pkg/e"
    "github.com/fcf/go-gin-example/pkg/util"
    "github.com/gin-gonic/gin"
)

type auth struct {
    Username string `valid:"Required; MaxSize(50)"`
    Password string `valid:"Required; MaxSize(50)"`
}

func GetAuth(c *gin.Context) {
    username := c.Query("username")
    password := c.Query("password")

    valid := validation.Validation{}

    a := auth{Username: username, Password: password}
    ok, _ := valid.Valid(&a)

    data := make(map[string]interface{})
    code := e.INVALID_PARAMS
    if ok {
        isExist, err := models.CheckAuth(username, password)
        if isExist {
            token, err := util.GenerateToken(username, password)
            if err != nil {
                code = e.ERROR_AUTH_TOKEN
            } else {
                data["token"] = token
                code = e.SUCCESS
            }
        } else if err != nil {
            fmt.Printf("auth is not exist: %x", err)
            code = e.ERROR_AUTH
        } else {
            code = e.ERROR_AUTH
        }
    } else {
        for _, err := range valid.Errors {
            log.Println(err.Key, err.Message)
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "code": code,
        "msg":  e.GetMsg(code),
        "data": data,
    })
}
```

- 修改router.go文件。添加获取作者接口和中间件

```go
package routers

import (
    "github.com/fcf/go-gin-example/middleware/jwt"
    "github.com/fcf/go-gin-example/pkg/setting"
    "github.com/fcf/go-gin-example/routers/api"
    v1 "github.com/fcf/go-gin-example/routers/api/v1"
    "github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
    r := gin.New()

    r.Use(gin.Logger())
    r.Use(gin.Recovery())

    gin.SetMode(setting.RunMode)

    r.GET("/auth", api.GetAuth)

    apiv1 := r.Group("/api/v1")
    apiv1.Use(jwt.JWT())
    {
        ...
    }

    return r
}
```

至此，调用任意一个接口，都需要带上token。否则会失败。

**验证**：

- GET：http://127.0.0.1:8000/auth?username=root&password=123456

#### 添加注册接口

上面接口肯定会失败，因为截止目前为止，还没有用户注册，所以是获取不到token的。所以额外给auth添加注册接口

- 给models下的auth.go文件加上注册和查询接口

```go
package models

import (
    "fmt"
    "time"

    "github.com/jinzhu/gorm"
)

type Auth struct {
    // ID       int    `gorm:"primary_key" json:"id"`
    Model

    Username string `json:"username"`
    Password string `json:"password"`
}

func (auth *Auth) BeforeCreate(scope *gorm.Scope) error {
    scope.SetColumn("CreatedOn", time.Now().Unix())
    return nil
}

func (auth *Auth) BeforeUpdate(scope *gorm.Scope) error {
    scope.SetColumn("ModifiedOn", time.Now().Unix())
    return nil
}

func CheckAuth(username, password string) (bool, error) {
    var auth Auth
    err := db.Select("id").Where(Auth{Username: username, Password: password}).First(&auth).Error
    if err != nil && err != gorm.ErrRecordNotFound {
        return false, err
    }
    if auth.ID > 0 {
        return true, nil
    }
    return false, nil
}

func RegistAuth(username, password string) bool {
    auth := Auth{
        Username: username,
        Password: password,
    }
    db.AutoMigrate(&Auth{})
    if err := db.Create(&auth).Error; err != nil {
        fmt.Println("xxxxxxfcf: RegistAuth 失败", err)
        return false
    }
    return true
}

// 判断Tag是否存在
func ExistAuthByName(username string) (bool, error) {
    var auth Auth
    err := db.Select("id").Where("username = ?", username).First(&auth).Error
    if err != nil && err != gorm.ErrRecordNotFound {
        return false, err
    }
    if auth.ID > 0 {
        return true, nil
    }
    return false, nil
}
```

- 给路由下的auth.go添加注册接口

```go
func RegistAuth(c *gin.Context) {
    username := c.Query("username")
    password := c.Query("password")

    valid := validation.Validation{}
    valid.Required(username, "username").Message("用户名不能为空")
    valid.MaxSize(username, 50, "username").Message("用户名最长50字节")
    valid.Required(password, "password").Message("密码不能为空")
    valid.MaxSize(password, 50, "password").Message("密码最长50字节")

    code := e.INVALID_PARAMS
    if !valid.HasErrors() {
        exist, _ := models.ExistAuthByName(username)
        if !exist {
            fmt.Printf("xxxxxxxx fcf %s 未注册过", username)
            suc := models.RegistAuth(username, password)
            if suc {
                fmt.Println("regist auth success")
                code = e.SUCCESS
            } else {
                fmt.Println("regist auth failed")
                code = e.ERROR
            }
        } else {
            code = e.ERROR_EXIST_AUTH
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "code": code,
        "msg":  e.GetMsg(code),
        "data": make(map[string]string),
    })
}
```

- 给router.go添加注册接口

```go
...
r.POST("/auth", api.RegistAuth)
r.GET("/auth", api.GetAuth)

apiv1 := r.Group("/api/v1")
...
```

**验证：**

- 注册POST：http://127.0.0.1:8000/auth?username=root&password=123456

- 登录获取Token，GET：http://127.0.0.1:8000/auth?username=root&password=123456

- 其他接口带上token：http://127.0.0.1:8000/api/v1/tags?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJwYXNzd29yZCI6IjEyMzQ1NiIsImV4cCI6MTY4NjM4NjY3NiwiaXNzIjoiZ2luLWJsb2cifQ.WVUVQ8tW9KHgv0YT27vQMxaR7ctGMoNwcMWF8n9vu_c

## 知识点：

- jwt使用与jwt作用

- 中间件的写作方式


