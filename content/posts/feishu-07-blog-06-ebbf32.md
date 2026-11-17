---
title: "实战07——blog项目06"
date: "2023-07-02"
category: "后端与 Go"
tags: ["网络与安全"]
description: "实战02——blog项目01 https://bhhbdrz3p9.feishu.cn/docx/WG1Ed9Tw3otZeQxgCTMcoFvnnPh 中创建了blog项目的基础框架。 实战03——blog项目02 h"
feishu_token: "PPX0dxS6ooj3edxYDEqcifgynre"
---

# 实战07——blog项目06

[实战02——blog项目01](https://bhhbdrz3p9.feishu.cn/docx/WG1Ed9Tw3otZeQxgCTMcoFvnnPh) 中创建了blog项目的基础框架。

[实战03——blog项目02](https://bhhbdrz3p9.feishu.cn/docx/HSAVdHEbcoRE5pxwwDqci8DGn4b) 将Blog标签类接口的开发完成。

[实战04——blog项目03](https://bhhbdrz3p9.feishu.cn/docx/EtKddbXVwoAcmxxYeGgc0GlPnjf) 完成了文章类接口的开发工作。

[实战05—— blog项目04](https://bhhbdrz3p9.feishu.cn/docx/S5WFd17Y2oBjwTxf1k8cUXB4n6g)  完成了使用JWT，处理用户登录注册，避免任意访问。

[实战06——blog项目05](https://bhhbdrz3p9.feishu.cn/docx/Hu1vdyDcBoA9PIxEwxCcJ5MXndc)  封装了一个log库，记录简单的日志

这节课的目标是使用Swagger给项目加上一个API文档。

### Swagger

因为纯手写API文档是非常艰难的，后续的变更很难持续维护。所以需要有一个自动生成的接口文档。

- 安装swag

```bash
$ go get -u github.com/swaggo/swag/cmd/swag
```

安装完成后，可以使用命令判断一下swag是否安装成功

```go
$ swag -v
```

如果没装成功，可能是环境变量中不包含GOBIN（GOROOT下的BIN目录）。所以最近将GOBIN加到环境变量中，也可以打开bin目录，查看一下是否有swag可执行文件。

- 编写注释
```go
// @summary 获取作者接口(相当于登录接口)
// @Produce json
// @Param username query string true "账号"
// @Param password query string true "密码"
// @Success 200 {string} json "{"code":200,"data":{"token": "xxxx5cCxxxx"},"msg":"ok"}"
// @Router /auth [GET]
func GetAuth(c *gin.Context) 
...

// @summary 注册作者
// @Produce json
// @Param username query string true "账号"
// @Param password query string true "密码"
// @Success 200 {string} json "{"code":200,"data":{},"msg":"ok"}"
// @Router /auth [POST]
func RegistAuth(c *gin.Context)
```

  - 完成后，在项目根目录下，执行 $swag init 命令。会自动在docs目录下生成几个文件：
```go
docs.go
swagger.json
swagger.yaml
```

  - **注意**：上述的注释是有一定规则的，否则swag init会报错。

- 安装gin-swagger插件

```bash
$ go get -u -v github.com/swaggo/gin-swagger

$ go get -u -v github.com/swaggo/files
```

- 在router.go文件中加入swagger的初始化动作和对应路由规则

```go
package routers

import (
    ...
    _ "github.com/fcf/go-gin-example/docs"
    swaggerFilles "github.com/swaggo/files"
    ginSwagger "github.com/swaggo/gin-swagger"
)

func InitRouter() *gin.Engine {
    ...
    gin.SetMode(setting.RunMode)
    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFilles.Handler))
    ...

    return r
}
```

这些都完成后，项目可以运行起来了。此时打开http://127.0.0.1:8000/swagger/index.html。就可以看到自动生成的API文档了。

![图片](/images/feishu/feishu-07-blog-06-ebbf32/XNGfbzqCJoK9kxxuH6HcCnJ8nub.png)

引用：[手把手教你使用go-swagger文档](https://zhuanlan.zhihu.com/p/549252410?utm_id=0)

## 知识点

- swagger的作用和使用


