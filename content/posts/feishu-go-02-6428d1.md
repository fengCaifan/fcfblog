---
title: "Go工程02 —— 包及结构布局"
date: "2023-02-05"
category: "后端与 Go"
tags: ["Go"]
description: "包package Go程序都是由包构成的。使用关键字 package ； 程序从main包开始运行，main包的main函数是所有应用程序的入口。（普遍性） 包使用文件夹进行物理隔离，可以理解为一个包是一个文件夹 。当然"
feishu_token: "WdcwdlfHQoCuchx0wAIchyMRnOd"
---

# Go工程02 —— 包及结构布局

## 包package

- Go程序都是由包构成的。使用关键字**package**；

- 程序从main包开始运行，main包的main函数是所有应用程序的入口。（普遍性）

- **包使用文件夹进行物理隔离，可以理解为一个包是一个文件夹**。当然了，如果包里有子包，则子包使用子文件夹就行。
  - 所以通常把处理同一类型业务的代码放到同一个包中。同样的，我们可以把归属于同一个目录的文件看作归属于同一个包。
  - 从另外一个角度来看：**import是对包的引用，但是其是对包path的引用**。所以如果一个文件夹下同一级目录有多个包，则import就无法正确引用了，会报错。
  - **包内不一定非得有跟包一样名字的文件**。比如**main包，不一定非得有main.go文件**，它可以是任意名字，main包只要有main函数就行。

- Go语言通过包来管理命名空间。比如函数调用：包名.函数 ；

- **同一个包的Go代码具备以下特性**：
  - 1、归属于同一个包的额源文件包声明语句要一致，即同一级目录的源文件必须属于同一个包
  - 2、在同一个包下，不同源文件中不能重复声明同一个变量、函数和类（结构体）

```go
// 方式1
import "fmt"
import "math"

// 方式2
import (
    "fmt"
    "math"
)
```

- 注意：package 是指包名，**import则引入的是路径**。比如path路径下的pack包。则是import "path", package pack。import 引入包，也意味着**不同的包在不同的目录中，否则import会报错**。

## Go程序布局

### 可执行程序布局

```go
project
├── cmd/
│ ├── app1/
│ │ └── main.go
│ └── app2/
│ │ └── main.go
├── go.mod
├── go.sum
├── internal/
│ ├── pkga/
│ │ └── pkg_a.go
│ └── pkgb/
│ │ └── pkg_b.go
├── pkg1/
│ └── pkg1.go
├── pkg2/
│ └── pkg2.go
└── vendor/
```

- cmd目录：存放main包的源文件。如果有多个可执行文件需要构建，则使用子目录隔开

- go.mod 、go.sum 直接放在工程根目录下

- 其他的包，就可以自行拆解了。

### 库项目

```go
lib-project
├── go.mod
├── internal/
│ ├─ pkga/
│ │    └── pkg_a.go
│ └─ pkgb/
│       └── pkg_b.go
├─ pkg1/
│ └── pkg1.go
└─ pkg2/ 
   └── pkg2.go
```


