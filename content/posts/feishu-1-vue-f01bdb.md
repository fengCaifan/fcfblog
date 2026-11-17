---
title: "1、Vue环境安装"
date: "2023-08-28"
category: "前端与小程序"
tags: ["内存管理","网络与安全","Vue / 前端"]
description: "安装npm 打开node官网:https://nodejs.org/zh cn/ 下载并安装 设置一下环境变量 使用国内淘宝镜像 查看镜像状态 或者可以直接打开文件查看 处理nmp的权限问题： （如果不处理npm的权限问"
feishu_token: "YAiId9pFxob2qpxIwPDcqfvenGb"
---

# 1、Vue环境安装

#### 安装npm

- 打开node官网:https://nodejs.org/zh-cn/
  - 下载并安装
```javascript
使用验证安装结果
node -v
```

  - 设置一下环境变量
```bash
#node
export PATH="$PATH:/usr/local/bin/"
```

- 使用国内淘宝镜像
```bash
npm config set registry  https://registry.npm.taobao.org/
```

  - 查看镜像状态
```bash
npm config get registry
```

  - 或者可以直接打开文件查看
```javascript
open .npmrc
```

- 处理nmp的权限问题：
  （如果不处理npm的权限问题，后续vue的一些命令也都会有权限问题）

  - 安装yarn
```bash
brew install yarn
```

  - 设置npm-gloal
```bash
$ mkdir ~/.npm-gloal
$ nmp config set prefix '~/.npm-global'
打开环境变量文件进行设置
export PATH="$PATH:~/.npm-global/bin/"
```

这样后续通过npm安装的任何东西都会被安装在npm-gloal中。之前默认的地址在usr/lib会有权限问题。

[mac npm install XX权限权限报错的完美解决方法(修改npm全局安装包的位置，解决EACCES权限拒绝问题)_mac npm eacces_苏一恒的博客-CSDN博客](https://blog.csdn.net/HuoYiHengYuan/article/details/100929070)

#### 安装vue脚手架工具

```bash
npm install -g @vue/cli
```

注意：如果有权限问题就使用sudo

#### 引用及遇到问题

- [npm使用国内淘宝镜像的方法(两种)_wx6407463693ee6的技术博客_51CTO博客](https://blog.51cto.com/u_15997490/6176457)

- [vue3.0的环境搭建和创建vue3.0项目](https://www.bilibili.com/read/cv18309786/)

- [创建vue项目报错command failed:npm install --loglevel error解决办法](https://segmentfault.com/a/1190000042659230)

- [mac安装报错Error: EACCES: permission denied, access '/usr/local/lib/node_modules_愚蠢地人类的博客-CSDN博客](https://blog.csdn.net/shaleilei/article/details/80812410?ydreferer=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8%3D)


