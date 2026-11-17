---
title: "实战03——blog项目02"
date: "2023-07-02"
category: "后端与 Go"
tags: ["网络与安全","Go","工程效率"]
description: "我们在 实战02——blog项目01 https://bhhbdrz3p9.feishu.cn/docx/WG1Ed9Tw3otZeQxgCTMcoFvnnPh 中创建了blog项目的基础框架。本节将开始Blog标签类接"
feishu_token: "HSAVdHEbcoRE5pxwwDqci8DGn4b"
---

# 实战03——blog项目02

我们在[实战02——blog项目01](https://bhhbdrz3p9.feishu.cn/docx/WG1Ed9Tw3otZeQxgCTMcoFvnnPh) 中创建了blog项目的基础框架。本节将开始Blog标签类接口的开发

## 定义标签接口

在routers下新建api目录，然后建立一个大版本v1目录。创建一个tag.go文件

```go
package v1

import (
    "github.com/gin-gonic/gin"
)

// 获取多个文章标签
func GetTags(c *gin.Context) {

}

// 新增文章标签
func AddTag(c *gin.Context) {

}

// 修改文章标签
func EditTag(c *gin.Context) {

}

// 删除文章标签
func DeleteTag(c *gin.Context) {

}
```

将接口注入到路由里。

```go
package routers

import (
    "github.com/fcf/go-gin-example/pkg/setting"
    v1 "github.com/fcf/go-gin-example/routers/api/v1"
    "github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
    r := gin.New()

    r.Use(gin.Logger())
    r.Use(gin.Recovery())

    gin.SetMode(setting.RunMode)

    apiv1 := r.Group("/api/v1")
    {
        // 获取标签列表
        apiv1.GET("/tags", v1.GetTags)
        // 新建标签
        apiv1.POST("/tags", v1.AddTag)
        // 更新
        apiv1.PUT("/tags/:id", v1.EditTag)
        // 删除
        apiv1.DELETE("/tags/:id", v1.DeleteTag)
    }
    return r
}
```

检查路由是否注册成功，可以执行go run 命令

## 编写标签接口实现

下载validation依赖包，用于后面验证表单

```bash
$go get -u github.com/astaxie/beego/validation
```

### 编写标签model

创建Models目录下的tag.go文件。用于标签model的操作。主要是对数据库的操作

```go
package models

// Tag结构体，用于给Gorm使用，并给与了附属属性json，这样子在c.JSON的时候就会自动转换格式
type Tag struct {
    Model

    Name       string `json:"name"`
    CreatedBy  string `json:"created_by"`
    ModifiedBy string `json:"modified_by"`
    State      int    `json:"state"`
}
// 这里的return 后面没有跟着变量。这是因为函数的声明中
// 已经明确显示了返回值是tags。
// db从哪里来？因为在同一个models包下，因此DB可以直接使用
func GetTags(pageNum int, pageSize int, maps interface{}) ([]Tag, error) {
    fmt.Printf("xxxxxxxx fcf gettags —— page: %d, size: %d", pageNum, pageSize)
    var (
        tags []Tag
        err  error
    )
    if pageSize > 0 && pageNum > 0 {
        err = db.Where(maps).Find(&tags).Offset(pageNum).Limit(pageSize).Error
    } else {
        err = db.Where(maps).Find(&tags).Error
    }
    if err != nil && err != gorm.ErrRecordNotFound {
        return nil, err
    }
    return tags, nil
}

func GetTagTotal(maps interface{}) (count int) {
    db.Model(&Tag{}).Where(maps).Count(&count)
    return
}
```

#### 编写获取标签列表的路由逻辑

在router的v1文件夹下，创建一个tag.go文件，用户处理接口逻辑

```go
package v1

import (
    "fmt"
    "net/http"

    "github.com/astaxie/beego/validation"
    "github.com/fcf/go-gin-example/models"
    "github.com/fcf/go-gin-example/pkg/e"
    "github.com/fcf/go-gin-example/pkg/setting"
    "github.com/fcf/go-gin-example/pkg/util"
    "github.com/gin-gonic/gin"
    "github.com/unknwon/com"
)

// 获取多个文章标签
func GetTags(c *gin.Context) {
    // c.Quuery 用户获取?name=test&state=1这类URL参数
    // c.DefaultQuery则支持设置一个默认值
    name := c.Query("name")
    fmt.Println("xxxxxxxx fcf 开始获取tags")

    maps := make(map[string]interface{})
    data := make(map[string]interface{})

    if name != "" {
        maps["name"] = name
    }
    var state int = -1
    if arg := c.Query("state"); arg != "" {
        state = com.StrTo(arg).MustInt()
        maps["state"] = state
    }
    code := e.SUCCESS

    // util.GetPage保证了各接口的page处理是一致的
    lists, err := models.GetTags(util.GetPage(c), setting.PageSize, maps)
    if err != nil {
        code = e.ERROR
        fmt.Println("xxxxxxxx fcf : 开始获取tags list 失败:", err)
    }
    data["lists"] = lists
    data["total"] = models.GetTagTotal(maps)
    fmt.Println("xxxxxxxx fcf : 开始获取tags")

    c.JSON(http.StatusOK, gin.H{
        "code": code,
        "msg":  e.GetMsg(code),
        "data": data,
    })
}

// 新增文章标签
func AddTag(c *gin.Context) {
    
}

// 修改文章标签
func EditTag(c *gin.Context) {
    
}

// 删除文章标签
func DeleteTag(c *gin.Context) {
    
}
```

这样获取标签的逻辑就写好了。可以使用命令行，进行验证。（注意端口号）

```bash
$ curl 127.0.0.1:8000/api/v1/tags
// 得到结果：{"code":200,"data":{"lists":[],"total":0},"msg":"ok"}
```

### 编写添加标签的逻辑

- 1、完善Models目录下的tag.go文件中
```go
package models

...

// 判断Tag是否存在
func ExistTagByName(name string) (bool, error) {
    var tag Tag
    err := db.Select("id").Where("name = ? AND deleted_on = ?", name, 0).First(&tag).Error
    if err != nil && err != gorm.ErrRecordNotFound {
        return false, err
    }

    if tag.ID > 0 {
        return true, nil
    }
    return false, nil
}

func AddTag(name string, state int, createdBy string) error {
    tag := Tag{
        Name:      name,
        State:     state,
        CreatedBy: createdBy,
    }
    db.AutoMigrate(&Tag{}) // 必须要这个，否则表会创建失败
    if err := db.Create(&tag).Error; err != nil {
        fmt.Println("xxxxxxfcf: addtag 失败", err)
        return err
    }
    return nil
}
... 
```

  - 注意：最初的版本没有写 db.AutoMigrate(&Tag{})，所以导致Create失败。

- 2、完善router下v1中tag.go关于添加标签的逻辑

```go
package v1

...
// 新增文章标签
func AddTag(c *gin.Context) {
    name := c.Query("name")
    fmt.Printf("xxxxxxxx fcf 开始添加tag name: %s", name)
    state := com.StrTo(c.DefaultQuery("state", "0")).MustInt()
    createdBy := c.Query("created_by")

    valid := validation.Validation{}
    valid.Required(name, "name").Message("名称不能为空")
    valid.MaxSize(name, 100, "name").Message("名称最长100字节")
    valid.Required(createdBy, "created_by").Message("创始人不能为空")
    valid.MaxSize(createdBy, 100, "created_by").Message("创始人最长100字节")
    valid.Range(state, 0, 1, "state").Message("状态只允许0或1")

    code := e.INVALID_PARAMS
    if !valid.HasErrors() {
        exist, err := models.ExistTagByName(name)
        if !exist {
            fmt.Printf("xxxxxxxx fcf model 数据不存在")
            err := models.AddTag(name, state, createdBy)
            if err != nil {
                fmt.Printf("add tag failed: %x", err)
                code = e.ERROR
            } else {
                fmt.Println("add tag success")
                code = e.SUCCESS
            }
        } else if err != nil {
            code = e.ERROR
        } else {
            code = e.ERROR_EXIST_TAG
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "code": code,
        "msg":  e.GetMsg(code),
        "data": make(map[string]string),
    })
}
... 
```

- 3、我们发现我们新增的标签，只上传了部分属性，有些属性是可以在服务端直接处理的。这个时候，gorm的callback就提供了对应的服务。它可以在对象创建的不同阶段，做对应的处理。

这里在Models下的tag中添加BeforeCreate和BeforeUpdate的回调处理逻辑。两个方法分别是自动处理createOn和ModifiedOn的逻辑。

gorm还支持的回调方法包括：

### 编写修改标签和删除标签的逻辑

- 完善models下tag的逻辑处理：

```go

func ExistTagByID(id int) bool {
    var tag Tag
    db.Select("id").Where("id = ?", id).First(&tag)
    return tag.ID > 0
}

func EditTag(id int, data interface{}) bool {
    db.Model(&Tag{}).Where("id = ?", id).Updates(data)
    return true
}

func DeleteTag(id int) bool {
    db.Where("id = ?", id).Delete(&Tag{})
    return true
}
```

- 完善路由下tag的逻辑处理：

```go
// 修改文章标签
func EditTag(c *gin.Context) {
    fmt.Println("xxxxxxxx fcf 修改tag")
    id := com.StrTo(c.Param("id")).MustInt()
    name := c.Query("name")
    modifiedBy := c.Query("modified_by")

    valid := validation.Validation{}

    var state int = -1
    if arg := c.Query("state"); arg != "" {
        state = com.StrTo(arg).MustInt()
        valid.Range(state, 0, 1, "state").Message("状态只允许0或1")
    }
    valid.Required(id, "id").Message("ID不能为空")
    valid.Required(modifiedBy, "modified_by").Message("修改人不能为空")
    valid.MaxSize(modifiedBy, 100, "modified_by").Message("修改人最长为100字符")
    valid.MaxSize(name, 100, "name").Message("名称最长为100字符")

    code := e.INVALID_PARAMS
    if !valid.HasErrors() {
        code = e.SUCCESS
        if models.ExistTagByID(id) {
            data := make(map[string]interface{})
            data["modified_by"] = modifiedBy
            if name != "" {
                data["name"] = name
            }
            if state != -1 {
                data["state"] = state
            }
            models.EditTag(id, data)
        } else {
            code = e.ERROR_NOT_EXIST_TAG
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "code": code,
        "msg":  e.GetMsg(code),
        "data": make(map[string]string),
    })
}

// 删除文章标签
func DeleteTag(c *gin.Context) {
    fmt.Println("xxxxxxxx fcf 删除tag")
    id := com.StrTo(c.Param("id")).MustInt()

    valid := validation.Validation{}
    valid.Min(id, 1, "id").Message("ID必须大于0")

    code := e.INVALID_PARAMS
    if !valid.HasErrors() {
        code = e.SUCCESS
        if models.ExistTagByID(id) {
            models.DeleteTag(id)
        } else {
            code = e.ERROR_NOT_EXIST_TAG
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "code": code,
        "msg":  e.GetMsg(code),
        "data": make(map[string]string),
    })
}
```

**验证**

- POST：http://127.0.0.1:8000/api/v1/tags?name=7&state=1&created_by=fcf

- GET：http://127.0.0.1:8000/api/v1/tags

- PUT：http://127.0.0.1:8000/api/v1/tags/5?name=5&state=0&modified_by=edit1

- DELETE：http://127.0.0.1:8000/api/v1/tags/3

## 知识点

- 某个接口的基本框架的雏形也就有了： M - R
  - Model层：具体接口的model结构体。函数用于对数据库操作
  - Router层：对关于某一个Model的接口进行处理，解析客户端发过来的请求数据。然后操作Model进行增删改查。


