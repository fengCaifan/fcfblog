---
title: "实战06——blog项目05"
date: "2023-07-02"
category: "后端与 Go"
tags: ["网络与安全","Go"]
description: "实战02——blog项目01 https://bhhbdrz3p9.feishu.cn/docx/WG1Ed9Tw3otZeQxgCTMcoFvnnPh 中创建了blog项目的基础框架。 实战03——blog项目02 h"
feishu_token: "Hu1vdyDcBoA9PIxEwxCcJ5MXndc"
---

# 实战06——blog项目05

[实战02——blog项目01](https://bhhbdrz3p9.feishu.cn/docx/WG1Ed9Tw3otZeQxgCTMcoFvnnPh) 中创建了blog项目的基础框架。

[实战03——blog项目02](https://bhhbdrz3p9.feishu.cn/docx/HSAVdHEbcoRE5pxwwDqci8DGn4b) 将Blog标签类接口的开发完成。

[实战04——blog项目03](https://bhhbdrz3p9.feishu.cn/docx/EtKddbXVwoAcmxxYeGgc0GlPnjf) 完成了文章类接口的开发工作。

[实战05—— blog项目04](https://bhhbdrz3p9.feishu.cn/docx/S5WFd17Y2oBjwTxf1k8cUXB4n6g)  完成了使用JWT，处理用户登录注册，避免任意访问。

这节的目标是封装一个log库，记录简单的日志

#### logging包

在pkg下新建一个logging文件夹，然后创建一个file.go和log.go文件。记得把logging添加到go.mod的replace

- file.go
```go
package logging

import (
    "fmt"
    "log"
    "os"
    "time"
)

var (
    LogSavePath = "runtime/logs/"
    LogSaveName = "log"
    LogFileExt  = "log"
    TimeFormat  = "20060102"
)

func getLogFilePath() string {
    return fmt.Sprintf("%s", LogSavePath)
}

func getLogFileFullPath() string {
    prefixPath := getLogFilePath()
    suffixPath := fmt.Sprintf("%s%s.%s", LogSaveName, time.Now().Format(TimeFormat), LogFileExt)
    return fmt.Sprintf("%s%s", prefixPath, suffixPath)
}

func openLogFile(filePath string) *os.File {
    _, err := os.Stat(filePath)
    switch {
    case os.IsNotExist(err):
        mdDir()
    case os.IsPermission(err):
        log.Fatalf("Permission :%v", err)
    }

    handle, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
    if err != nil {
        log.Fatal("Fail to OpenFile :%v", err)
    }
    return handle
}

func mdDir() {
    dir, _ := os.Getwd()
    err := os.MkdirAll(dir+"/"+getLogFilePath(), os.ModePerm)
    if err != nil {
        panic(err)
    }
}
```

  - os.Stat：返回文件信息结构描述文件
  - os.IsNotExist：判断文件或文件夹是否存在
  - os.Permission：返回权限是否满足
  - os.OpenFile：传入文件名称、指定模式调用文件、文件权限
```go
const (
    // Exactly one of O_RDONLY, O_WRONLY, or O_RDWR must be specified.
    O_RDONLY int = syscall.O_RDONLY // 以只读模式打开文件
    O_WRONLY int = syscall.O_WRONLY // 以只写模式打开文件
    O_RDWR   int = syscall.O_RDWR   // 以读写模式打开文件
    // The remaining values may be or'ed in to control behavior.
    O_APPEND int = syscall.O_APPEND // 在写入时将数据追加到文件中
    O_CREATE int = syscall.O_CREAT  // 如果不存在，则创建一个新文件
    O_EXCL   int = syscall.O_EXCL   // 使用O_CREATE时，文件必须不存在
    O_SYNC   int = syscall.O_SYNC   // 同步IO
    O_TRUNC  int = syscall.O_TRUNC  // 如果可以，打开时
)
```

  - os.Getwd：返回与当前目录对应的根路径名
  - os.MkdirAll：创建对应目录以及子目录
  - os.ModePerm：`const`定义`ModePerm FileMode = 0777`

- log.go

```go
package logging

import (
    "fmt"
    "log"
    "os"
    "path/filepath"
    "runtime"
)

type Level int

var (
    F                  *os.File
    DefaultPrefix      = ""
    DefaultCallerDepth = 2

    logger     *log.Logger
    logPrefix  = ""
    levelFlags = []string{"DEBUG", "INFO", "WARN", "ERROR", "FATAL"}
)

const (
    DEBUG Level = iota
    INFO
    WARN
    ERROR
    FATAL
)

func init() {
    filePath := getLogFileFullPath()
    F = openLogFile(filePath)

    logger = log.New(F, DefaultPrefix, log.LstdFlags) // 创建一个新的日志器
}

func Debug(v ...interface{}) {
    setPrefix(DEBUG)
    logger.Println(v)
}

func Info(v ...interface{}) {
    setPrefix(INFO)
    logger.Println(v)
}

func Warn(v ...interface{}) {
    setPrefix(WARN)
    logger.Println(v)
}

func Error(v ...interface{}) {
    setPrefix(ERROR)
    logger.Println(v)
}

func Fatal(v ...interface{}) {
    setPrefix(FATAL)
    logger.Println(v)
}

func setPrefix(level Level) {
    _, file, line, ok := runtime.Caller(DefaultCallerDepth)
    if ok {
        logPrefix = fmt.Sprintf("[%s][%s:%d]", levelFlags[level], filepath.Base(file), line)
    } else {
        logPrefix = fmt.Sprintf("[%s]", levelFlags[level])
    }
    logger.SetPrefix(logPrefix)
}
```

可以尝试将fmt和log的打印都换成自己的。最后生成的日志文件在当前项目下的runtime/logs里

## 知识点：

- 这个工具类的写法和iOS是差不多的。估计是所有打印函数本身设计都类似。

- 文件夹的部分操作


