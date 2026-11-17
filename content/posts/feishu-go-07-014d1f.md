---
title: "Go语言07——错误处理"
date: "2023-02-19"
category: "后端与 Go"
tags: ["Go"]
description: "错误处理 Error go语言内置错误接口类型error。 最佳实践 在多个返回值的函数中，error通常作为函数最后一个返回值 如果一个函数返回error类型，应该先用if判断error是否为nil defer语句应该"
feishu_token: "XU0wdAIKto4SImxy77jcNF8TnuQ"
---

# Go语言07——错误处理

## 错误处理

### Error

- go语言内置错误接口类型error。

```go
type error interface {
    Error() string
}
```

- 最佳实践
  - 在多个返回值的函数中，error通常作为函数最后一个返回值
```go
func add(a, b int) (c int, err error) {
    if (a < 0 || b > 0) {
        err = error.New("只支持非负整数相加")
        return
    }
    c = a + b
    return
}
```

  - 如果一个函数返回error类型，应该先用if判断error是否为nil
  - defer语句应该放到error判断的后面，不然有可能产生panic
  - 错误逐级向上传递的过程中，错误信息应该不断完善，而不是简单地抛出。

### panic和recover

这两个内置函数是用来处理go的运行时错误，panic是主动抛出错误，recover是捕获panic抛出的错误。

- panic抛出异常：1、程序主动调用panic函数；2、程序产生运行时错误
  - panic函数支持的参数类型是 interface{}
```go
func panic(v interface{})
```

- panic抛出异常后，defer 后接函数依旧会执行。如果defer后接函数里还有panic抛出，则会依旧会被其他defer后接函数捕获。知道退出当前函数。
```go
package main
import "fmt"

func main() {
    defer func() {
        fmt.Println("代码清理逻辑")
    }()
    var i = 1
    var j = 0
    if j == 0 {
        panic("除数不能为0！")
    }
    k := i/j
    fmt.Printf("%d / %d = %d\n", i,j,k)
}

// 打印结果。后面有中断main协程的打印
代码清理逻辑
panic: 除数不能为0！

goroutine 1 [running]:
main.main()
        /tmp/sandbox3375109050/prog.go:11 +0x49
```

  - 当调用的函数抛出panic后，就相当于当前函数对panic的调用，所以就会一直往上panic，从而中断整个协程后续代码的执行。当然，每个函数抛出panic之前，都可以执行defer后接函数。
  - 多次调用panic函数，只有最后一次能抛出错误。

Recover函数则是对panic进行捕获和处理，从而避免程序崩溃后直接退出，而是继续可以执行后续代码。

- 注意这里还是会退出抛出panic的当前函数，回到调用它的地方继续后续代码的执行。

- recover函数必须在defer后接函数体内被直接调用。recover函数需要主动程序调用进行拦截。

```go
package main

import "fmt"

func divide() {
    defer func() {
        if err := recover(); err != nil {
            fmt.Printf("runtime panic caught: %v\n", err)
        }
    }()
    var i = 1
    var j = 0
    k := i / j
    fmt.Printf("%d \ %d = %d\n", i,j,k)
}

func main() {
    divide()
    fmt.Println("divide 方法调用完毕，回到main函数") // 这里仍然可以继续执行
}
```

### 总结：

- 能够容忍的错误，使用error返回，不阻断程序运行

- 不能容忍的错误，使用panic抛出或由运行时抛出。

- panic的使用类似断言的作用


