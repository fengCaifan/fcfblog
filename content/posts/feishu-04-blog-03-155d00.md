---
title: "实战04——blog项目03"
date: "2023-06-10"
category: "后端与 Go"
tags: ["网络与安全","Go","Flutter","工程效率"]
description: "在 实战02——blog项目01 https://bhhbdrz3p9.feishu.cn/docx/WG1Ed9Tw3otZeQxgCTMcoFvnnPh 中创建了blog项目的基础框架。 实战03——blog项目02"
feishu_token: "EtKddbXVwoAcmxxYeGgc0GlPnjf"
---

# 实战04——blog项目03

在[实战02——blog项目01](https://bhhbdrz3p9.feishu.cn/docx/WG1Ed9Tw3otZeQxgCTMcoFvnnPh) 中创建了blog项目的基础框架。

[实战03——blog项目02](https://bhhbdrz3p9.feishu.cn/docx/HSAVdHEbcoRE5pxwwDqci8DGn4b) 将Blog标签类接口的开发完成。

这节的目标是完成文章类接口定义和编写

### 定义接口

- 文章类接口主要包括：
  - 获取文章列表
  - 获取指定文章
  - 新建文章
  - 更新指定文章
  - 删除文章

- 在routers下v1版本下新建article.go文件，并创建接口

```go
package v1

import (
    "github.com/gin-gonic/gin"
)

/// 获取单个文章
func GetArticle(c *gin.Context) {
    
}

/// 获取文章列表
func GetArticles(c *gin.Context) {

}

/// 新增文章
func AddArticle(c *gin.Context) {

}

/// 修改文章
func EditArticle(c *gin.Context) {

}

/// 删除文章
func DeleteArticle(c *gin.Context) {
    
}
```

- 将接口名称添加到router.go中

```go
package routers

import (
    "github.com/fcf/go-gin-example/pkg/setting"
    v1 "github.com/fcf/go-gin-example/routers/api/v1"
    "github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
    ...
    apiv1 := r.Group("/api/v1")
    {
       ...
        /// 获取文章列表
        apiv1.GET("/articles", v1.GetArticles)
        /// 获取指定文章
        apiv1.GET("/articles/:id", v1.GetArticle)
        /// 新增文章
        apiv1.POST("/articles", v1.AddArticle)
        /// 更新指定文章
        apiv1.PUT("/articles/:id", v1.EditArticle)
        /// 删除指定文章
        apiv1.DELETE("/articles/:id", v1.DeleteArticle)
    }

    return r
}
```

### 编写Models逻辑

- 在models下创建一个article.go文件，用于承载Article对象和解码逻辑
```go
package models

import (
    "time"

    "github.com/jinzhu/gorm"
)

type Article struct {
    Model

    TagID int `json:"tag_id" gorm:"index"`
    Tag Tag `json:"tag"`

    Title string `json:"title"`
    Desc string `json:"desc"`
    Content string `json:"content"`
    CreatedBy string `json:"created_by"`
    ModifiedBy string `json:"modified_by"`
    State int `json:"state"`
}

func (article *Article) BeforeCreate(scope *gorm.Scope) error {
    scope.SetColumn("CreatedOn", time.Now().Unix())
    return nil
}

func (article *Article) BeforeUpdate(scope *gorm.Scope) error {
    scope.SetColumn("ModifiedOn", time.Now().Unix())
    return nil
}
```

  - Article结构体里有一些和Tag不一样的东西。
    - gorm:index 用于声明这个字段为索引，（不是很理解）
    - Tag字段是嵌套进的结构体，它利用TagID与Tag进行关联。在执行查询的时候，能够达到Article、Tag关联查询功能
    - time.Now().Unix()：返回当前时间戳

- 编写Model下的操作逻辑
```go
package models

import (
    "time"

    "github.com/jinzhu/gorm"
)

...
// / 查询是否存在该文章
func ExistArticleByID(id int) bool {
    var article Article
    db.Select("id").Where("id = ?", id).First(&article)
    return article.ID > 0
}

// / 获取文章数量
func GetArticleTotal(maps interface{}) (count int) {
    db.Model(&Article{}).Where(maps).Count(&count)
    return
}

// / 获取文章列表
func GetArticles(pageNum int, pageSize int, maps interface{}) ([]Article, error) {
    var (
        articles []Article
        err      error
    )

    if pageNum > 0 && pageSize > 0 {
        err = db.Preload("Tag").Where(maps).Find(&articles).Offset(pageNum).Limit(pageSize).Error
    } else {
        err = db.Preload("Tag").Where(maps).Find(&articles).Error
    }
    if err != nil && err != gorm.ErrRecordNotFound {
        return nil, err
    }
    return articles, nil
}

// / 获取单个文章
func GetArticle(id int) (article Article) {
    db.Where("id = ?", id).First(&article)
    db.Model(&article).Related(&article.Tag)
    return
}

// / 编辑文章
func EditArticle(id int, data interface{}) bool {
    db.Model(&Article{}).Where("id = ?", id).Updates(data)
    return true
}

// / 新增文章
func AddArticle(data map[string]interface{}) bool {
    article := Article{
        TagID:     data["tag_id"].(int),
        Title:     data["title"].(string),
        Desc:      data["desc"].(string),
        Content:   data["content"].(string),
        CreatedBy: data["created_by"].(string),
        State:     data["state"].(int),
    }
    db.AutoMigrate(&Article{})
    if err := db.Create(&article).Error; err != nil {
        fmt.Println("xxxxxxfcf: addArticle 失败", err)
        return false
    }
    return true
}

// / 删除文章
func DeleteArticle(id int) bool {
    db.Where("id = ?", id).Delete(Article{})
    return true
}
```

  - Article如何关联到tag？
  在获取单个文章func GetArticle(id int) (article Article)接口逻辑中，对二者进行了关联。要能够达到关联，首先gorm本身做了大量约定俗成

  - Preload是什么？为什么查询可以得出每一项的关联Tag？
  Preload是一个预加载器。它会执行下面两条sql。

```sql
SELECT * FROM blog_articles;
SELECT * FROM blog_tag WHERE id IN (1,2,3,4);
```

  查询出结果后，gorm内部处理对应的映射逻辑，将其填充到Article的Tag中。避免了循环查询

  - v.(I) 是什么？
  func AddArticle(data map[string]interface{}) bool 接口中出现了很多v.(I)，这个就是类型断言。用于判断一个接口值的实际类型是否为某一个类型，或一个非接口值的类型是否实现了某个接口类型。

- 编写router下v1版本下article接口。（待验证）

```go
package v1

import (
    "fmt"
    "log"
    "net/http"

    "github.com/astaxie/beego/validation"
    "github.com/fcf/go-gin-example/models"
    "github.com/fcf/go-gin-example/pkg/e"
    "github.com/fcf/go-gin-example/pkg/setting"
    "github.com/fcf/go-gin-example/pkg/util"
    "github.com/gin-gonic/gin"
    "github.com/unknwon/com"
)

// / 获取单个文章
func GetArticle(c *gin.Context) {
    id := com.StrTo(c.Param("id")).MustInt()
    valid := validation.Validation{}
    valid.Min(id, 1, "id").Message("ID必须大于0")

    code := e.INVALID_PARAMS
    var data interface{}
    if !valid.HasErrors() {
        if models.ExistArticleByID(id) {
            data = models.GetArticle(id)
            code = e.SUCCESS
        } else {
            code = e.ERROR_NOT_EXIST_ARTICLE
        }
    } else {
        for _, err := range valid.Errors {
            log.Printf("err.key: %s, err.message: %s", err.Key, err.Message)
        }
    }
    c.JSON(http.StatusOK, gin.H{
        "code": code,
        "msg":  e.GetMsg(code),
        "data": data,
    })
}

// / 获取文章列表
func GetArticles(c *gin.Context) {
    data := make(map[string]interface{})
    maps := make(map[string]interface{})
    valid := validation.Validation{}

    var state int = -1
    if arg := c.Query("state"); arg != "" {
        state = com.StrTo(arg).MustInt()
        maps["state"] = state

        valid.Range(state, 0, 1, "state").Message("状态只允许0或1")
    }

    var tagId int = -1
    if arg := c.Query("tag_id"); arg != "" {
        tagId = com.StrTo(arg).MustInt()
        maps["tag_id"] = tagId

        valid.Min(tagId, 1, "tag_id").Message("标签ID必须大于0")
    }

    code := e.INVALID_PARAMS
    if !valid.HasErrors() {
        articles, err := models.GetArticles(util.GetPage(c), setting.PageSize, maps)
        if err != nil {
            code = e.ERROR
            fmt.Println("xxxxxxxx fcf : 开始获取articles list 失败:", err)
        }
        code = e.SUCCESS
        data["lists"] = articles
        data["total"] = models.GetArticleTotal(maps)
    } else {
        for _, err := range valid.Errors {
            log.Printf("err.key: %s, err.message: %s", err.Key, err.Message)
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "code": code,
        "msg":  e.GetMsg(code),
        "data": data,
    })
}

// / 新增文章
func AddArticle(c *gin.Context) {
    tagId := com.StrTo(c.Query("tag_id")).MustInt()
    title := c.Query("title")
    desc := c.Query("desc")
    content := c.Query("content")
    createdBy := c.Query("created_by")
    state := com.StrTo(c.DefaultQuery("state", "0")).MustInt()

    valid := validation.Validation{}
    valid.Min(tagId, 1, "tag_id").Message("标签id必须大于0")
    valid.Required(title, "title").Message("标题不能为空")
    valid.Required(desc, "desc").Message("简述不能为空")
    valid.Required(content, "content").Message("内容不能为空")
    valid.Required(createdBy, "created_by").Message("创建人不能为空")

    code := e.INVALID_PARAMS
    if !valid.HasErrors() {
        if models.ExistTagByID(tagId) {
            data := make(map[string]interface{})
            data["tag_id"] = tagId
            data["title"] = title
            data["desc"] = desc
            data["content"] = content
            data["created_by"] = createdBy
            data["state"] = state

            suc := models.AddArticle(data)
            if suc {
                fmt.Println("添加文章成功")
                code = e.SUCCESS
            } else {
                fmt.Println("添加文章失败")
            }
        } else {
            code = e.ERROR_NOT_EXIST_TAG
        }
    } else {
        for _, err := range valid.Errors {
            log.Printf("err.key: %s, err.message: %s", err.Key, err.Message)
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "code": code,
        "msg":  e.GetMsg(code),
        "data": make(map[string]interface{}),
    })
}

// / 修改文章
func EditArticle(c *gin.Context) {
    valid := validation.Validation{}

    id := com.StrTo(c.Param("id")).MustInt()
    tagId := com.StrTo(c.Query("tag_id")).MustInt()
    title := c.Query("title")
    desc := c.Query("desc")
    content := c.Query("content")
    modifiedBy := c.Query("modified_by")

    var state int = -1
    if arg := c.Query("state"); arg != "" {
        state = com.StrTo(arg).MustInt()
        valid.Range(state, 0, 1, "state").Message("状态只允许0或1")
    }
    valid.Min(id, 1, "id").Message("ID必须大于0")
    valid.MaxSize(title, 100, "title").Message("标题最长100字符")
    valid.MaxSize(desc, 255, "desc").Message("简述最长255字符")
    valid.MaxSize(content, 65535, "content").Message("内容最长65535字符")
    valid.Required(modifiedBy, "modified_by").Message("修改人不能为空")
    valid.MaxSize(modifiedBy, 100, "modified_by").Message("修改人最长100字符")

    code := e.INVALID_PARAMS
    if !valid.HasErrors() {
        if models.ExistArticleByID(id) {
            if models.ExistTagByID(tagId) {
                data := make(map[string]interface{})
                if tagId > 0 {
                    data["tag_id"] = tagId
                }

                if title != "" {
                    data["title"] = title
                }

                if desc != "" {
                    data["desc"] = desc
                }

                if content != "" {
                    data["content"] = content
                }

                data["modified_by"] = modifiedBy
                models.EditArticle(id, data)
                code = e.SUCCESS
            } else {
                code = e.ERROR_NOT_EXIST_TAG
            }
        } else {
            code = e.ERROR_NOT_EXIST_ARTICLE
        }
    } else {
        for _, err := range valid.Errors {
            log.Printf("err.key: %s, err.message: %s", err.Key, err.Message)
        }
    }
    c.JSON(http.StatusOK, gin.H{
        "code": code,
        "msg":  e.GetMsg(code),
        "data": make(map[string]string),
    })
}

// / 删除文章
func DeleteArticle(c *gin.Context) {
    id := com.StrTo(c.Param("id")).MustInt()

    valid := validation.Validation{}
    valid.Min(id, 1, "id").Message("ID 必须大于0")

    code := e.INVALID_PARAMS
    if !valid.HasErrors() {
        if models.ExistArticleByID(id) {
            models.DeleteArticle(id)
            code = e.SUCCESS
        } else {
            code = e.ERROR_NOT_EXIST_ARTICLE
        }
    } else {
        for _, err := range valid.Errors {
            log.Printf("err.key: %s, err.message: %s", err.Key, err.Message)
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

- POST：http://127.0.0.1:8000/api/v1/articles?tag_id=5&title=test2&desc=test_desc2&content=content_test2&created_by=fcf&state=1

- GET：http://127.0.0.1:8000/api/v1/articles

- GET：http://127.0.0.1:8000/api/v1/articles/1

- PUT：http://127.0.0.1:8000/api/v1/articles/4?tag_id=7&title=test-4&desc=test-desc-4&content=test-content-4&modified_by=fcf&state=0

- DELETE：http://127.0.0.1:8000/api/v1/articles/4


