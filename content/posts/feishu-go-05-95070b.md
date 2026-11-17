---
title: "Go语言05——接口"
date: "2023-02-26"
category: "后端与 Go"
tags: ["Swift","Go"]
description: "接口 一个程序是由各个类或结构体组合而成的。前面我们学到的很多内容都是围绕在单个的类或结构体是怎么实现的。那怎么把这些类过结构体连接组合起来？这个就是我们接口要做的事。它负责的就是类与类直接耦合的部分。 接口声明和实现 "
feishu_token: "BZArdZXJAohESOxAwO1cAoQwnDd"
---

# Go语言05——接口

## 接口

一个程序是由各个类或结构体组合而成的。前面我们学到的很多内容都是围绕在单个的类或结构体是怎么实现的。那怎么把这些类过结构体连接组合起来？这个就是我们接口要做的事。它负责的就是类与类直接耦合的部分。

### 接口声明和实现

- 大多数现代语言都有接口。通过使用关键字interface（swift是protocol）来定义一些协议接口。要实现该接口的类可以使用implement或直接继承的方式来实现对应的接口方法。这就表示履行协议了。

- Go语言中，类对接口的实现和子类对父类的继承一样。**一个类只要实现了某个接口要求的所有方法，我们就说这个类实现了该接口**。注意，一定是所有接口方法。

- 所以Go语言中，为了和类区分开来，使用了**interface**关键字来声明接口。其次协议里的方法，是不用**func**关键字标识的。它只有**函数名+函数签名（参数列表+返回值列表）**。

```go
type IFile interface {
    Read(buf []byte) (n int, err error)
    Write(buf []byte) (n int, err error)
    Close() error
}

type IReader interface {
    Read(buf []byte) (n int, err error)
}

type File struct {
}

func (f *File)Read(buf []byte) (n int, err error) {

}

func (f *File)Write(buf []byte) (n int, err error) {

}

func (f *File)Close() error {

}
```

尽管File类没有显示实现这些接口，甚至不知道这些接口的存在，但是我们说File类实现了这些接口，因为File类实现了上述所有接口声明的方法。换句话说，**如果一个接口的方法集合是某个类型成员方法集合的子集，我们就认为该类实现了这个接口**。这里要注意一点：Go语言规定：***T类型的方法集合包含所有以*T为receiver参数类型的方法，以及所有以T为receiver参数类型的方法集合。**[Go语言02——函数和方法](https://bhhbdrz3p9.feishu.cn/docx/I1wsdjX2GoVmblx9SFwc1hpdnkf?from=space_persnoal_filelist)** **

### 空接口类型

- Go语言中，空接口，即表示没有任何实际方法的接口：**interface{}**

- 上面说到，Go语言没有什么继承，方法的继承和复用，都是通过组合来实现的。类与接口直接也不用通过implements关键字进行强绑定。

- 另外接口的的实现是通过**类的方法列表中是否包含接口内所有方法**来推断的。那**如果是一个空接口，那么就是所有类都实现了这个接口**。反过来讲，我们也可以通过**空接口**来**指向任意类型**。

- 在[Go语言02——函数和方法](https://bhhbdrz3p9.feishu.cn/docx/I1wsdjX2GoVmblx9SFwc1hpdnkf) 中，任意类型的不定参数，就是使用了空接口的性质。

- 空接口类型也让Go具有泛型语法的能力。

- go1.18也出了Any关键字，实际上底层就是空接口。

### 接口设计原则

- 尽量小接口；方法个数尽可能在1~3个之间。

- 尽量不要使用空接口作为二函数参数类型，因为空接口不提供任何信息

### 接口类型底层特性

- **静态特性**
  - 编译期间，编译器会对接口类型进行静态类型检测。

- **动态特性**
  - 运行时，接口类型存储的就是真实类型信息。这就是动态类型。

- **nil的error值 != nil **（**面试必备**）

[29｜接口：为什么nil接口不等于nil？-极客时间](https://time.geekbang.org/column/article/473414)

### 接口垂直组合

- 在其他语言中，接口B继承自接口A，如果某个类实现了接口B，则必须实现这两个接口中声明的方法。

- Go语言也有类似的“接口继承”。它**是通过接口组合的方式来实现的，**这种组合方式叫“**垂直组合**”。垂直组合也有多种方式。
  - 组合是没有父子关系或上下关系的。

##### 第一种：通过嵌入接口构建接口

```go
type ReadWriter interface {
    Reader
    Writer
}
```

##### 第二种：通过嵌入接口构建结构体类型

```go
type MyReader struct {
    io.Reeader
    N int64
}
```

##### 第三种：代理（TODO）

Go语言接口**只包含方法，不包含任何属性**。（swift可以包含属性）

```go
type A interface {
    Foo()
}

type B interface {
    A
    Bar()
}

type T struct {}

func (t T) Foo() {
    // 
}

func (t T) Bar() {

}
```

### 接口赋值

- Go语言接口赋值，是指：
  - 1、将实现接口的类实例赋值给接口；
  - 2、将一个接口赋值给另一个接口；

#### 类实例赋值给接口

- 只包含值方法

```go
package main

import (
        "fmt"
)

type Math interface {
    Add(i Integer) Integer
    Multiply(i Integer) Integer
}

type Integer int

func (a Integer) Add(b Integer) Integer {
    return a + b
}

func (a Integer) Multiply(b Integer) Integer {
    return a * b
}

func main() {
        var a Integer = 1
        var m Math = a
        fmt.Println(m.Add(1))
}
```

对于值方法而言，进行接口赋值时，**传递a实例的指针引用也是可以的**。因为非指针方法，Go底层会自动生成一个与之对应的指针成员方法。***T类型的方法集合包含所有以*T为receiver参数类型的方法，以及所有以T为receiver参数类型的方法集合**

```go
func (a *Integer) Add(i Integer) Integer {
    return (*a).Add(i)
}

func (a Integer) Multiply(i Integer) Integer {
    return (*a).Multiply(i)
}

var a Integer = 1
var m Math = &a
fmt.Println(m.Add(1))
```

- 包含指针方法
  - 如果**接口中包含了归属于指针的实现方法，则做接口赋值时，就只能传递指针类型**了。

```go
package main

import "fmt"

type Math interface {
    Add(i Integer)
    Multiply(i Integer) Integer
}

type Integer int

func (a *Integer) Add(b Integer) {
        (*a) = (*a) + b
}

func (a Integer) Multiply(b Integer) Integer {
    return a * b
}

func main() {
        var a Integer = 1
        var m Math = &a
        m.Add(2)
        fmt.Println(a)
}
```

#### 接口赋值给接口

- Go语言中，**只要两个接口拥有相同的方法列表（与顺序无关），那么它们就是等同的，可以相互赋值**。

- 当然了，这个赋值是指实现了接口协议的类的实例间的赋值

##### 方法对等

```go
type Number1 interface {
    Equal(i int) bool
    LessThan(i  int) bool
}

type Number2 interface {
    LessThan(i  int) bool
    Equal(i int) bool
}

type Number int
func (n Number) Equal(i int) bool {
    return int(n) == i
}

func (n Number) LessThan(i  int) bool {
    return int(n) < i
}

var num1 Number = 1
var num2 Number1 = num1
var num3 Number2 = num2
```

##### 方法子集

- 如果是子集的话，则方法列表大的接口可以赋值给方法列表小的接口，反之则会报错。

```go
type Number3 interface {
    LessThan(i int) bool
    Equal(i int) bool
    MoreThan(i int) bool
}

func (n Number) MoreThan(i  int) bool {
    return int(n) > i
}

var num1 Number = 1
var num2 Number3 = num1
var num3 Number2 = num2 // 这里会报错

// 反之
var num1 Number = 1
var num2 Number2 = num1
var num3 Number3 = num2 /// 成立
```

### 类型断言

- 可以用于推断某一个实例是否是某一种类型，看下面语法。如果推断正确，则会ok为true，变量v的类型为T，值是i的右值；如果推断不正确，则ok为false，变量v是类型T的零值。

```go
v, ok := i.(T)
```

- 但是用这种推断的话，一旦推断错误，ok==false，则会抛出panic。所以不是很建议使用这种语法。

### 接口的几种模式

#### 基本模式

接口类型作为函数的参数

```go
func YourFuncName(param YourInterface) { }
```

#### 创建模式

创建模式，就是用于创建某一实现了某一种接口的结构体。也就是某一些结构体的构造方法NewXXX包含了接口类型的参数

```go
func NewXXX(param YourInfercase) *XXX { }
```

#### 包装器模式

传入某个接口类型，在不改变其类型的情况下，该类型经过这个包装器处理后，具备了新的功能特性的。

```go
func YourWrapperFunc(param YourInterface) YourInterface { }
```

#### 适配器模式

适配器模式的核心是适配器函数类型。适配器函数类型可以将满足特定函数签名的普通函数，显示转换成自身类型的实例，转换后的实例同时也是接口的实现者。

```go
func greetings(w http.ResponseWriter, r http.Request) {
    fmp.Fprintf(w, "Welcome")
}

func main() {
    http.ListenAndServe(":8080", http.HandlerFunc(greetings))
}
```

- http.HandleFunc适配器

```go
type Handler interface {
    ServeHTTP(ResponseWriter, *Request)
}

type HandlerFunc func(ResponseWriter, *Request)

func (f HandlerFunc) ServeHTTP(w ResponseWriter, r *Request) {
    f(w, r)
}
```

#### 中间件

中间件其实就是中介者模式，是包装器和适配器模式结合的产物

```go
func validateSuth(s string) error {
    if s != "123456" {
        return fmt.Errorf("%s", "bad auth token")
    }
    return nil
}

func greetings(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Welcome")
}

func logHandler(h http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        t := time.Now()
        log.Printf("[%s] %q %v\n", r.Method, r.URL.String(), t)
        h.SeerveHTTP(w, r)
    })
}

func authHandler(h http.Handler) http.Handler {
    return http.HandlerFunc(func (w http.ResponseWriter, r *http.Request) {
        err := validateAuth(r.Header.Get("auth"))
        if err != nil {
            http.Error(w, "bad auth param", http.StatusUnauthorized)
            return
        }
        h.ServeHTTP(w, r)
    })
}

func main() {
    http.ListenAndServe(":8080", logHandler(authHandler(http.HandlerFunc(greetings))))
}
```

## 知识点：

- **正交性**：几何中，两条线以直角相交，那么这两条线就是正交的。你移动任一条线，在另一条线上的投影位置不变。也就是不会相互影响。
  - 计算机中表示：两个或更多事务中，一个发生变化，不会影响其他事务。比如更换数据库，不会影响到界面。
    - Go语言中类型定义是正交独立的，也就是没有父子类的概念。
    - 方法和类型是正交的。方法的本质其实就是将：receiver作为第一个参数的函数而已。
    - 接口与实现是正交的。

-


