---
title: "2、创建第一个Flutter项目"
date: "2023-08-30"
category: "Flutter 与跨端"
tags: ["性能与稳定性","网络与安全","Flutter"]
description: "上一节中，安装完成了IDE环境， Mac 环境安装 https://bhhbdrz3p9.feishu.cn/docx/PGYldS2Vco8qs7xGrRxcxiKCnbl 创建flutter 项目 打开模拟器运行 需"
feishu_token: "OwJCdlANYo4t6Ix4AT4c1nRXnQb"
---

# 2、创建第一个Flutter项目

上一节中，安装完成了IDE环境，[Mac 环境安装](https://bhhbdrz3p9.feishu.cn/docx/PGYldS2Vco8qs7xGrRxcxiKCnbl) 

## 创建flutter 项目

- 打开模拟器运行
  - 需要先打开一个模拟器，vscode是无法启动模拟器的
```swift
open -a Simulator
```

  - 完成了之后，再点击VSCode上的运行调试。就可以在模拟器中使用安装了。

## 项目分析

初始化的默认项目，是一个计数器。所有逻辑代码都是在main.dart文件中。

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;
  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;
  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

### 导入包

```dart
import 'package:flutter/material.dart';
```

这里导入的是Material UI组件库。类似iOS的UIKit

### **应用入口**

### **应用结构**

#### **首页**

所以这里整个流程就是：当右下角的悬浮按钮floatingActionButton被点击后，会调用事件接受函数_incrementCounter。_incrementCounter中会首先自增_counter计数器。然后setState会通知Flutter框架发生变化，接着Flutter框架会调用build函数以新的状态重新构建UI，最终显示在设备屏幕上。


