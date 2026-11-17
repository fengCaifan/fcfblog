---
title: "Go 001 环境搭建"
date: "2023-02-05"
category: "后端与 Go"
tags: ["网络与安全","Go"]
description: "经多次安装Go环境总结。Mac环境下，使用Homebrew安装Go是最方便的，而且后续升级也方便。 首先附上Homebrew的安装： Mac 安装 brew 2020最新，不报错 _普通Gopher的博客 CSDN博客 "
feishu_token: "NE3udJPf0o14T9xIFDGcLa3nn7g"
---

# Go 001 环境搭建

经多次安装Go环境总结。Mac环境下，使用Homebrew安装Go是最方便的，而且后续升级也方便。

首先附上Homebrew的安装：

- [Mac 安装 brew (2020最新，不报错)_普通Gopher的博客-CSDN博客](https://blog.csdn.net/qq_43442524/article/details/110239184)

完了后，使用下面命令进行Go的安装：

```bash
$brew install go
```

安装的过程中，在显示出Go的安装包的下载地址，和Go被安装的地址。我的地址，被安装在了：

```go
/usr/local/Cellar/go/1.19.5
```

结束后可以使用 $go version查看安装的版本，也可以使用$go env 查看环境配置。

在mac中，需要将Go的路径配置到环境变量中，也就是~/.zshrc文件中的Path。当然了，也可以配置一些其他配置。

```bash
#Go
#GoRoot
export GOROOT=/usr/local/Cellar/go/1.19.5/libexec
#GoPath
export GOPATH=/Users/fan/Documents/LearnSpace/GoLearn
#Go other
export GOBIN=$GOROOT/bin
export GO111MODULE=on
export PATH=$PATH:/usr/local/Cellar/go/1.19.5/bin
#Go end
```

解释一下

GoRoot：Go安装目录

GOPATH：工作目录。也就是所写的代码和项目，都放在这个目录下。

GOBIN： Go的bin目录。里面是可运行文件

GO111MODULE： 是否使用module。现在一般是使用的。

### VSCode go环境配置

[为 Go 开发配置Visual Studio Code](https://learn.microsoft.com/zh-cn/azure/developer/go/configure-visual-studio-code)

主要包括：

- 1、go插件安装。

- 2、go instal or update tools

- 3、VSCode的使用


