---
title: "Go 实战命令（安装、构建项目、添加依赖）"
date: "2023-06-04"
category: "后端与 Go"
tags: ["网络与安全","Go"]
description: "环境安装相关命令 mac下使用homebrew安装go环境 升级go 完成后设置go的环境变量即可。基本设置了Gobin就可以在任何地方使用go 命令了。 创建项目相关命令 使用go modules创建项目 创建项目文件"
feishu_token: "BTUKdEDjUof6IlxRDYBcpMnbnMg"
---

# Go 实战命令（安装、构建项目、添加依赖）

## 环境安装相关命令

- mac下使用homebrew安装go环境

```bash
$brew install go
```

- 升级go

```bash
$ brew upgrade go
```

- 完成后设置go的环境变量即可。基本设置了Gobin就可以在任何地方使用go 命令了。

## 创建项目相关命令

使用go modules创建项目

- 创建项目文件夹，并切换到项目里去

```bash
$ mkdir go-product && cd go-product
```

- 打开modules。打开go module开关。通常这个在Go环境配置的时候一并设置即可，这样就不用每次新项目都设置一遍。可参考[Go 001 环境搭建](https://bhhbdrz3p9.feishu.cn/docx/NE3udJPf0o14T9xIFDGcLa3nn7g) 

```bash
$ go env -w GO111MODULE=on
```

- 设置goproxy代理。这里其实也可以在Go环境配置的时候设置。主要因为Go和项目依赖的一些库都是在国外，国内很难获取到。https://goproxy.cn是七牛云背书的稳定go模块代理。direct是一个选项，它表示go在拉取模块时遇到错误会回源到模块安保的源地址去抓取。

```bash
$ go env -w GOPROXY=https://goproxy.cn,direct
```

- 使用go mod在工程根目录下初始化项目。
  - go mod init [module_path]：初始化go modules，它将生成一个go.mod文件。
  - 

```bash
$ go mod init github.com/fcf/go-gin-example
```

## 添加依赖

- 添加gin框架

```bash
$ go get -u github.com/gin-gonic/gin
```

## 部分命令说明

- go get：用于拉取依赖库
  - 拉取最新版本(优先选取tag)：$ go get golang.org/x/text@lastest
  - 拉取master分支最新commit：$ go get golang.org/x/text@master
  - 拉取tag为v0.2.1的commit：$ go get golang.org/x/text@v0.2.1
  - 拉取 hash 为 342b231 的 commit，最终会被转换为 v0.3.2：`$go get ``golang.org/x/text@342b2e`
  - 用 go get -u更新现有的依赖

- go mod：go mod相关命令一般与go.mod文件有关
  - go mod download 下载go.mod文件中指明的所有依赖
  - go mod tidy 矫正现有第三方库的依赖
  - go mod graph查看现有依赖结构
  - go mod init 生成go.mod文件
  - go mod edit编辑go.mod文件
  - go mod vendor 导出现有的所有依赖
  - go mod vertify 矫正一个模块是否被篡改过

-


