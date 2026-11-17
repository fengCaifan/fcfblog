---
title: "Go工程03 —— 程序的执行次序"
date: "2023-02-05"
category: "后端与 Go"
tags: ["多线程与并发","Go"]
description: "入口函数：main函数 Go可执行程序的入口就是： main包中的main函数，也就是main.main 。 无参数无返回值： Go语言要求： 可执行程序的main包必须定义main函数 ，否则Go编译器会报错。在多协程"
feishu_token: "E6WedNFWHoPCoMxd2YDceijQnCg"
---

# Go工程03 —— 程序的执行次序

### 入口函数：main函数

- Go可执行程序的入口就是：**main包中的main函数，也就是main.main**。
  无参数无返回值：

```go
package main 

func mian() {
    ... 
}
```

- Go语言要求：**可执行程序的main包必须定义main函数**，否则Go编译器会报错。在多协程Goroutine中，main.main函数将在Go应用的主Goroutine中执行。
  - 注意：除了main包外，其他包也可以拥有自己的名为main的函数或方法。但是非main包中的main函数仅限于包内使用（也就是小写的main，外部调用不到）。比如下面代码。所以也可以看到其实就是**非main包也可以有名为main的函数，但是其是私有的，外包并不会主动调用，也就是相当于一个普通的函数**。
```go
package pkg1

import "fmt"

func Main() {
    main()
}

/// 可以定义main()，但是是小写的。外部无法调用。
/// 所以其实可以看做是一个叫做main的普通函数
func main() {
    fmt.Println("main func for pkg1")
}
```

- **main函数是入口函数，但是却不是第一个被执行的函数**。

第一个被执行的函数应该是包的**初始化函数init函数**。（和OC中每个类的构造函数或load函数会先于main函数调用一样的）

### 包的初始化函数：init函数

- 每个Go包都有一个构造函数：init函数。和main函数一样，没有参数和返回值：
```go
func init() {
    ...
}
```

- init函数会在main函数执行前被执行。

- Go程序中**不能显式地调用init**，否则会包编译错误。

- **Go包可以不止一个init函数，可以定义多个，按声明顺序依次执行**。

- 每个init函数在整个Go程序生命周期内仅会被执行一次。

- init函数是按顺序执行的。如果初始化失败了，则正常panic就行。

- init函数用途。
  init函数的作用其实与其在初始化过程中的时机密不可分。

  - 重置包级变量值；（TODO：不太理解）
  - 对包级变量的复杂初始化；（TODO：不太理解）
  - 在init函数中实现“注册模式”；
    - 比如使用空导入的方式，就可以直接作用到init函数。此时在init函数中进行注册，则都不用对外直接暴露了。

### Go 包初始化次序

Go程序是由一组包组成的，程序的初始化就是所有包的初始化过程。每个包还会有自己的依赖包、常量、变量、init函数等

![图片](/images/feishu/feishu-go-03-490a3b/boxcnsBqQiskTMlwanDb1RnMK3d.png)

- 初始化步骤，使用**深度优先**原则：
  - 从main的第一个依赖的包 pkg1 开始初始化；
  - 依次递归初始化各个包的依赖；
  - 到最深处没有依赖后，则进行**初始化**，顺序按照：常量——>变量——>init函数；
  - 然后往回递归初始化，直到回到main函数。然后对第二个依赖包进行初始化；
  - 直到main的所有依赖都初始化完成，则对main包自身进行初始化，同样按照：常量——>变量——>init函数；
  - **所有初始化完成后，才正式进入程序的main函数**；


