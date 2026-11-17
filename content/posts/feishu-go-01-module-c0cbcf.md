---
title: "Go工程01 —— Module详解"
date: "2023-06-11"
category: "后端与 Go"
tags: ["Go","工程效率"]
description: "GOPATH 老的Go语言是使用GOPATH来构建Go应用程序的。 这个GOPATH就是我们设置的环境变量。如果没有额外设置，则会有默认值。 当一个成员引入了第三方时。Go编译器会在GOPATH目录下搜索。如果没有搜索到"
feishu_token: "FQEXdu36IoIrrvxpyVScLRaDnxd"
---

# Go工程01 —— Module详解

### GOPATH

老的Go语言是使用GOPATH来构建Go应用程序的。

这个GOPATH就是我们设置的环境变量。如果没有额外设置，则会有默认值。

当一个成员引入了第三方时。Go编译器会在GOPATH目录下搜索。如果没有搜索到，则会无法编译通过。

此时，就需要go get命令将第三方依赖包下载到本地。但是有个问题，它下载的是各个包的最新主线版本。

所以。**GOPATH构建下，Go编译器无法管理第三方依赖包的版本**。

### Vendor

Go 1.5版本引入了vendor，它是Go项目的某个特定目录，它会将项目的所有依赖包缓存起来。这样就不会受GOPATH的包影响。

所以使用vendor的最佳实践就是将vendor一并提交到代码仓库中。

因此，**vendor的问题就是：vendor本身提交到代码仓库很占空间。另一个就是vendor也是需要手动管理的。**

### Go Module

Go Module是go目前默认的包依赖管理机制和Go源码构建机制。有点类似iOS的Cocoapods。

Go Module是有版本的。所以module下的包也就有了版本属性。

Go Module 的核心是一个名为go.mod的文件。

**注意：Go Module项目是无需在GOPATH下进行创建的**。

#### Go Module基本操作

- 1、创建工程目录（工作区）文件夹 GoPractice
```bash
$mkdir GoPractice
```

- 2、创建一个子项目 module-mode
```bash
$mkdir module-mode
```

- 3、创建main.go，添加依赖
```go
package main

import (
    "github.com/sirupsen/logrus"
)

func main() {
    logrus.Println("hello, go module mode")
}
```

- 4、创建go mod，使用

```bash
$go mod init xxx // xxx 工程名
```

这样当前项目就变成了一个Go Module。

**Tips**:

如果有三方库没有索引或者下载下来。则build的时候是会报错的。

- 5、下载三方库，使用命令：

```bash
$go mod tidy
```

则会自动根据源码下载和添加第三方依赖。

- 6、go build执行构建。go run 运行

- 7、升级 / 降级依赖库
  （关于版本信息可以查看下面的语义导入版本内容）

  - **非主版本升降级**：比如从v1.8.0 降到 v1.7.0。(升级是一样处理)
    查看某个库的所有版本：

```go
$ go list -m -version github.com/sirupsen/logrus
```

    - 方案1：使用 $go get 命令：
```bash
$go get github.com/sirupsen/logrus@v1.7.0
```

    执行完后，会打印出下面信息，并将go.mod中对logrus的依赖版本从v1.8.0 将至 v1.7.0

```go
go: downloading github.com/sirupsen/logrus v1.7.0
go get: downgraded github.com/sirupsen/logrus v1.8.0 => v1.7.0
```

    - 方案2：使用 $go edit + go mod tidy
```bash
$go mod edit -require=github.com/sirupsen/logrus@v1.7.0
$go mod tidy
```

  - **主版本升降级**
  方案就是后续的语义导入版本。

- 8、移除依赖
  从源码里将import删除，然后使用go mod tidy重新构建。

- 9、

##### 其他：

- 空导入：表示一个包，导入了没有使用。

```go
import _ "fmt" // 说明没有对fmt的具体使用。
```

- 下载某个库下的所有的包，下面命令会下载github.com/cweill/gotests下所有子包
```bash
$go get -u github.com/cweill/gotests/...
```

  - 在环境安装环境有设置一个GOPATH，项目开发过程中，通过go get下载的第三方依赖源码都会存储$GOPATH/pkg/mod中。可执行文件会在GOROOT=/usr/local/Cellar/go/1.19.5/libexec下的bin目录中，所以GOBIN也应该加到PATH中。

#### 深入Go Module

Go module是怎么做到版本兼容或选择的？

##### 语义导入版本

go mod文件中的版本，都是按照v x.y.z 来的。**x表示主版本，y表示次版本号，z表示补丁版本号**。

**如果主版本相同，则新旧版本是兼容的**。比如v1.7.0和v.1.8.1，则v.1.8.1是兼容v1.7.0的。

**如果主版本不同，则新旧版本是不兼容的**。解决方法就是：**将包主版本号引入到包路径中**。比如：

```go
import "github.com/sirupsen/logrus/v2"
```

甚至可以同时依赖两个不兼容版本

```go
import (
    "github.com/sirupsen/logrus"
    logv2 "github.com/sirupsen/logrus/v2"
)
```

##### 最小版本选择

复杂的项目，可能会出现不同的包依赖同一个包的不同版本。比如

![图片](/images/feishu/feishu-go-01-module-c0cbcf/boxcnjJym6c9tw9I2rP73smgsrc.png)

很多语言对这种情况会选择**最新最大的版本，**也就是v1.7.0。但是Go mod会选出符合项目整体要求的**最小版本**，也就是这里的v1.3.0。


