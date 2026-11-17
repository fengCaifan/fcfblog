---
title: "1、Mac 环境安装"
date: "2023-08-30"
category: "Flutter 与跨端"
tags: ["Flutter","工程效率"]
description: "安装SDK 安装rosetta 2 https://juejin.cn/s/%E5%AE%89%E8%A3%85rosetta%202 去官网下载SDK ：https://flutter.cn/docs/get star"
feishu_token: "PGYldS2Vco8qs7xGrRxcxiKCnbl"
---

# 1、Mac 环境安装

## 安装SDK

- [安装rosetta 2](https://juejin.cn/s/%E5%AE%89%E8%A3%85rosetta%202)

```bash
sudo softwareupdate --install-rosetta
```

- 去官网下载SDK ：https://flutter.cn/docs/get-started/install/macos 注意看mac芯片类型：苹果芯片使用arm64架构

- 将下载的sdk，解压到合适位置

```bash
#我将flutter sdk放到了 “文稿”目录下，位置自定
cd ~/Documents

#解压
unzip ~/Downloads/flutter_macos_3.3.10-stable.zip
```

- 配置PATH，打开~/.zshrc

```bash
# Flutter
# 这两个是国内flutter镜像
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn

# 设置环境变量
export flutter_Home=~/Documents/Flutter/flutter
export PATH=$PATH:$flutter_Home/bin
```

只会执行一些命令查看和生效环境变量

```bash
source ~/.zshrc # 刷新zshrc
echo $PATH # 查看PATH
which flutter # 查看flutter命令是否可用
```

- 运行flutter doctor

```bash
flutter doctor -v
```

这个命令会检查当前环境配置，并生成一份报告。

这样SDK就安装完成。

## 配置VSCode IDE环境

- 启动VSCode

- 快捷键： command+shift+p

- 输入install， 选择Extensions: Install Extension action。

- 搜索框中输入 flutter，点击安装即可。

- 验证：
  - 重启VSCode
  - 快捷键： command+shift+p
  - 输入doctor，选择：Flutter: Run Flutter Doctor
  - 查看命令行输出。


