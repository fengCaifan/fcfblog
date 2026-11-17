---
title: "Go练习02——递归及尾递归调优"
date: "2022-11-30"
category: "后端与 Go"
tags: ["性能与稳定性","Go","算法与数据结构"]
description: "斐波那契数列求解Demo 加上耗时检测 通过内存缓存技术优化递归函数性能 使用尾递归优化 函数调用，底层是通过栈来维护的。所以如果递归调用太深，栈就会越来越大，消耗大量内存空间，严重情况下会导致栈溢出。 尾调用 ：指函数"
feishu_token: "JFckdxy0ZoebuPxcukVcVHBxneb"
---

# Go练习02——递归及尾递归调优

## 斐波那契数列求解Demo

```go
package main

import "fmt"

func fibonacci(n int) int {
    if n == 1 {
        return 0
    }
    
    if n == 2 {
        return 1
    }
    
    return fibonacci(n - 1) + fibonacci(n - 2)
}

func main() {
    n := 5
    result := fibonacci(n)
    fmt.Printf("The %dth number of fibonacci sequence is %d\n", n, result)
}
```

- 加上耗时检测

```go
package main

import (
    "fmt"
    "time"
)

type Fibonacci func(int) int

func fibonacci(n int) int {
    if n == 1 {
        return 0
    }
    
    if n == 2 {
        return 1
    }
    
    return fibonacci(n - 1) + fibonacci(n - 2)
}

func fibonacciExecTime(f Fibonacci) Fibonacci {
    return func(n int) int {
        start := time.Now()
        num := f(n)
        end := time.Since(start)
        fmt.Printf("--- 执行耗时: %v ---\n", end)
        return num
    }
}

func main() {
    f := fibonacciExecTime(fibonacci)
    n1 := 5
    r1 := f(n1)
    fmt.Printf("The %dth number of fibonacci sequence is %d\n", n1, r1)
    
    n2 := 20
    r2 := f(n2)
    fmt.Printf("The %dth number of fibonacci sequence is %d\n", n2, r2)
}
```

- 通过内存缓存技术优化递归函数性能

```go
const Max = 50
var fibs [Max]int
func fibonacci(n int) int {
    if n == 1 {
        return 0
    }
    
    if n == 2 {
        return 1
    }
    
    index := n - 1
    if fibs[index] != 0 {
        return fibs[index]
    }
    
    num := fibonacci(n - 1) + fibonacci(n - 2)
    fibs[index] = num
    return num
}
```

- 使用尾递归优化
  - 函数调用，底层是通过栈来维护的。所以如果递归调用太深，栈就会越来越大，消耗大量内存空间，严重情况下会导致栈溢出。
  - **尾调用**：指函数的最后一个动作是调用一个函数。若调用的函数是自身，则是**尾递归**。**尾调用的一个重要特性是它不是在函数调用栈上添加一个新的堆栈帧——而是更新它**。因此尾递归可以极大优化内存占用，提升程序性能。
  - 斐波那契函数，在最后一行，会递归调用两次，并相加。所以需要改成只调用一次自身。

```go
package main

import (
    "fmt"
    "time"
)

type Fibonacci func(int) int

// 尾递归
func fibonacciTail(n, first, second int) int {
    if n < 2 {
        return first
    }
    return fibonacciTail(n-1, second, first + second)
}

func fibonacci(n int) int {
    return fibonacciTail(n, 0, 1)
}

func fibonacciExecTime(f Fibonacci) Fibonacci {
    return func(n int) int {
        start := time.Now()
        num := f(n)
        end := time.Since(start)
        fmt.Printf("--- 执行耗时: %v ---\n", end)
        return num
    }
}

func main() {
        f := fibonacciExecTime(fibonacci)
        n1 := 5
    r1 := f(n1)
    fmt.Printf("The %dth number of fibonacci sequence is %d\n", n1, r1)
    
    n2 := 1000
    r2 := f(n2)
    fmt.Printf("The %dth number of fibonacci sequence is %d\n", n2, r2)
}
```


