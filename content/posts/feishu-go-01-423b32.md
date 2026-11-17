---
title: "Go语言01——基础数据类型及控制结构"
date: "2023-02-18"
category: "后端与 Go"
tags: ["Swift","内存管理","网络与安全","Go"]
description: "Go指南 https://tour.go zh.org/list （从swift的角度学习Golang） 第一个Go语言程序：Hello world 语言特性 源代码文件以 .go 为后缀； 程序是 UTF 8 编码；（"
feishu_token: "VO2bdSfinoRl9Dx4FhmcOPnsnzb"
---

# Go语言01——基础数据类型及控制结构

[Go指南](https://tour.go-zh.org/list) （从swift的角度学习Golang）

第一个Go语言程序：Hello world

```go
# hello.go

package main

import "fmt"

func main() {
    fmt.Printf("hello world \n")
}
```

## 语言特性

- 源代码文件以**.go**为后缀；

- 程序是**UTF-8**编码；（普遍性）

- 标识符区分大小写；（普遍性）

- 语句分号可以省略；（和swift一样）

- 强类型静态编程语言
  - 即使是两个类型拥有相同的底层类型，但他们仍然是不同的数据类型，不可以被相互比较或混在一个表达式中进行运算。
```go
type myInt int

var a myInt = 1
var b int = a + 1 // 编译报错

const n myInt = 10
const m int = n + 1 // 编译报错
```

## 变量

- **变量相当于是对一块数据存储空间的命名，程序通过定义一个变量来申请一块数据存储空间，之后通过引用变量名来使用这块存储空间。该存储空间中存放的数据类型由定义变量时指定的类型决定**，**该内存地址里存放的内容可以改变    **。 （普遍性）

```go
var a int = 1
var a int = 1 * 3
var {
    v1 int
    v2 string
}
b, c := 1, "hello" // 多重赋值。

_, name = getName() // _ 匿名变量
func getName() (name1, name2 string) {
    return "1", "2"
}
```

- 使用**var**声明变量；（和swift一样）

- 变量名后面跟变量的类型。变量名与类型，使用空格隔开。（swift使用: 分隔）
  - 为什么这么干？感觉就是为了实现像 3~6行这种方式的声明。

- **:= **是类型推导，只能出现在函数体内，其他地方还是要使用var。**所以建议在函数外部，尽可能使用var。**（swift也有类型推导，是在类型不是很明确的时候，但是还是会使用var关键字，go可以省略）。这个类型推导是在编译期做的，而不是运行时。所以Go还是不折不扣的静态语言。

- 变量内存：**Go语言提供自动内存管理，通常程序员不需要关注变量的生命周期和存放位置。编译器使用栈逃逸技术能够自动为变量分配空间：可能在栈上，也可能在堆上**。（swift也是自动内存管理，不过是使用引用计数的技术进行管理的。**TODO：这个Go的底层技术后续需要调研**）

- 多重赋值：多重赋值，可以非常轻松地写交换语句:
```go
i,j = j,i
```

- 匿名变量：使用:_;

- 作用域：和其他语言是一样的。全局、局部。

- **注意⚠️：Go语言没有static变量，只有局部变量、全局变量(包级变量)**

## 常量

- **使用一个名称来绑定一个内存地址，该内存地址中存放的数据类型由定义变量时指定的类型决定**，**该内存地址里存放的内容在编译期间就已知，且****不****可以改变**。（普遍性）

- **常量存储在程序的只读数据区**；（存储位置也和Swift一样）

- 常量是在编译区间就会被创建，也就是说，如果是表达式，则必须编译期间就能求出值。

- 常量使用关键字**const**

- 常量不能使用 := 语法

- **隐式转型**
  - 对于无类型常量参与的表达式，Go编译器会根据上下文中的类型信息，把无类型常量自动转换为相应的类型后，再参与求值计算。（当然了，必须是能正常转的类型）
```go
type myInt int

const n myInt = 10
const m int = n + 1 // 编译报错

const a = 1 // 无类型常量。不过其实是myInt类型

var b myInt = 5
var c = a + b
```

- **实现枚举**

**Go语言是没有枚举类型的。所以Go语言通过常量来实现枚举**。其实**枚举本身就是由有限个常量构成的集合**。所以使用常量来实现Go语言的枚举也是一种改良了。

首先，其他语言的枚举，比如C语言。如果没有显示地指定初始化值，则默认第一个常量的值就是0，后续会自增加1。

```c
enum Weekday {
    sunday    // 默认是0
    monday    // 1，由sunday=0，自增加1而来
    ...
}
```

但是Go语言的const没有继承这个特性，Go语言中，它会自动重复上一行的初始值。

```go
package main

import (
        "fmt"
)

const (
        Apple = 1
        Banana
        Strawberry
)

func main() {
        fmt.Println(Apple) // 1
        fmt.Println(Banana) // 1
        fmt.Println(Strawberry) // 1
}
```

所以为了实现这个自增。Go语言又提供了一个“神器”：**iota**

## 基础数据类型

```go
var v1 int            // 整形，零值：0
var v2 string         // 字符串，零值：""
var v3 bool           // 布尔，零值：false
var v4 [10]int        // 数组，零值：[0 0 0 0 0 0 0 0 0 0]
var v5 struct {       // 结构体，零值：{ 0 }
    f float64
}
var v6 *int           // 指针，零值：<nil>
var v7 map[string]int // 字典，零值：map[]
var v8 func(a int) int // 函数类型，零值：<nil>
```

### bool布尔

- 默认是false；（和Swift一样）

- 不能与整型进行转换（也不能强制转换），即1并不代码true；（和Swift一样）

### int整型

- Go语言的整型有很多种，不同类型的整型必须进行强制类型转换；（和Swift一样）

- 单独int可能表示int32，也可能表示int64，根据具体框架而定。
  - **int是平台有关的，位数会根据具体平台变更。但是int32、int64这种是确定的。所以建议最好使用int32、int64这种**。

- Go语言中，++、--这种运算符，不能作为前缀，**只能作为后缀使用**。

- Go语言是强类型语言，不同类型的值不能进行比较。（和Swift一样）

### float 浮点型

- Go语言只有两种**float32**和**float64**，所以注意不能直接使用float；（**独特性**）

- 浮点数直接不应该使用 == 或 != 进行比较运行，高精度科学计算应该使用math；（**注意：这里用的是不应该，而不是从语法层面上禁止，所以如果不小心使用了，也是可以正常运行的，但是建议不要这样用**）

- float32是单精度浮点数，精确到小数点后7位，float64是双精度浮点数，精确到小数点后15位。类似于swift中的double。

- 建议使用float64。

### 复数类型

- 好像很少使用到

- 形如z=a+bi（a、b均为实数）的数称为复数 （百科）

### 字符串

- **字符串是常量，是不可变的**。所以这提高了字符串的并发安全性和存储利用率。
  - 可以通过类似数组的索引访问其字节单元，**但是不能修改某个字符的值**
```go
var a = "hello world"
b := a[0]
a[1] = 'a' // 这是错误的，不能修改字符
```

  - 虽然不能修改某个字符，但是**可以进行二次赋值**
```go
var s = "hello"
s[0] = 'H' // 错误
s = "Hello" // 正确
```

  - 所有由于它的不可变性。**无论它在程序的什么位置被使用，Go编译器都是只分配一块内存**。大大提高了存储利用率。

- 字符串转换为切片**[]byte(s)**要慎用，因为每转换一次都需复制内容。（**独特性**）

- 字符串尾部不包含NULL。字符串底层是一个二元结构体。一个指针指向字节数组的起点，另一个是长度；（**独特性**）

```go
type stringStruct struct {
    str unsafe.Pointer // 指向底层字节数组的指针
    len int // 字节数组长度
}
```

- 基于字符串创建的切片，实际还是指向原字符串底层字符数组，所以依旧还是字符串，而非slice。

```go
var a = "hello world"
b := a[0:4]
```

- 字符串可以转成字节数组，也可转成Unicode数组，即**rune**类型。unicode和非Unicode的长度是不一样的。

```go
package main

import (
        "fmt"
        "unicode/utf8"
)

func main() {
        str := "世界"
        fmt.Printf("the length of s = %d\n", len(str)) // 6 
        for i := 0; i < len(str); i++ {
                fmt.Printf("0x%x ", str[i]) // 0xe4 0xb8 0x96 0xe7 0x95 0x8c
        }
        
        fmt.Println("\nthe character count in s is", utf8.RuneCountInString(str)) // 2
        for _, ch := range str {
                fmt.Printf("0x%x ", ch) // 0x4e16 0x754c
        }
}
```

- 字符串运算，可以使用+拼接、可以使用for- range和for-rune遍历

```go
str := "hello, 世界"
for i, ch := range str {
    fmt.Println(i, ch)
}
```

#### rune VS byte类型

Go语言中，支持两种字符串类型：（**独特性**）

- rune，表示单个Unicode编码的字符，**占用4个字节**。Unicode专用的转义字符\u或\U作为前缀。

- byte，代表UTF-8编码中的单个字节的值，**占据1个字节的内存空间**。

#### UTF-8 VS Unicode

- Unicode 是一种字符集，囊括了目前世界上所有语言的所有字符。广义的Unicode既包含了字符集，也包含了编码规则。

- UTF-8 是Unicode字符集的实现方式之一，它会将Unicode字符以某种方式进行编码。

#### 字符串常见操作

- 下标操作

```go
var s = "中国人"
fmt.Printf("0x%x\n", s[0]) // 打印的不是'中',而是字符'中'utf-8编码的第一个字节
```

- 迭代操作: for range

```go
var s = "中国人"
// 错误操作
for i := 0; i < len(s); i++ {
    fmt.Printf("index: %d,value: 0x%x\n", i, s[i])
}
// 正确操作，但是i不是表示0、1、2
for i, v := range s {
    fmt.Printf("index: %d,value: 0x%x\n", i, v)
}
```

- 连接，使用+

```go
s := "中"
s = s + "国"
s += "人"
fmt.Printf(s)
```

- 字符串比较：== 、 != 、>= 、<= 、> 、< 都可以。

- 字符串转换。与字符切片、rune双向转换

```go
var s string = "中国人"
rs := []rune(s)
fmt.Printf("%x\n", rs)

bs := []byte(s)
fmt.Printf("%x\n", bs)

s1 := string(rs)
fmt.Printf(s1)

s2 := string(bs)
fmt.Printf(s2)
```

### 类型转换

- T(v)：将值v转换成类型T （和其他语言一样）

- 在有符号与无符号、高位数字向地位数字转化时，需要注意数字溢出和截断。

- Go 语言提供了字符串与基础数据类型的转换：strconv包

### 字符串转换练习：

```go
package main

import (
        "fmt"
        "strconv"
)

func main() {
        v1 := "100"
        v2, _ := strconv.Atoi(v1) // 字符串转化成整形，
        fmt.Println("v2 is %s", v2)
        v3 := 100
        v4 := strconv.Itoa(v3) // 整形转字符串
        fmt.Println("v2 is %s", v4)
        
        v5 := "true"
        v6,_ := strconv.ParseBool(v5) // 将字符串转成布尔
        v5 = strconv.FormatBool(v6) // 将布尔转成字符串
        fmt.Println("v6 is %s, v5 is %s", v6, v5)
        
        v7 := "100"
        v8, _ := strconv.ParseInt(v7, 10, 64)   // 将字符串转化为整型，第二个参数表示进制，第三个参数表示最大位数
        fmt.Println("v7is %s, v8 is %s", v7, v8)
        v7 = strconv.FormatInt(v8, 10)   // 将整型转化为字符串，第二个参数表示进制
        v9, _ := strconv.ParseUint(v7, 10, 64)   // 将字符串转化为无符号整型，参数含义同 ParseInt
        v7 = strconv.FormatUint(v9, 10)  // 将字符串转化为无符号整型，参数含义同 FormatInt
        fmt.Println("v9 is %s, v7 is %s", v7, v9)
        
        
        v10 := "99.99"
        v11, _ := strconv.ParseFloat(v10, 64)   // 将字符串转化为浮点型，第二个参数表示精度
        v10 = strconv.FormatFloat(v11, 'E', -1, 64)
        fmt.Println("v10 is %s, v11 is %s", v10, v11)
        q := strconv.Quote("Hello, 世界")    // 为字符串加引号
        fmt.Println("q is %s", q)
        q = strconv.QuoteToASCII("Hello, 世界")  // 将字符串转化为 ASCII 编码
        fmt.Println("q is %s", q)
}
```

## 复合数据类型

### 指针

```go
a := 100 // 变量a代表存储了值为100的内存空间。a只是一个名称。
var ptr *int // 声明一个指向int类型的指针
ptr = &a // 取变量a所在的内存地址。
fmt.Println(*ptr) // *ptr 获取指针指向内存地址存储的变量值
```

- 类型*T是指向T类型值的指针。&操作符会生成一个指向其操作数的指针

- 使用*表示，使用&获取变量的地址 （可以理解为指针即地址）（和C一样）

- 结构体指针，访问结构体字段仍使用.操作符（和C一样） 

- Go语言禁止指针运算 （**独特性**）

- 函数中允许返回局部变量的地址 （**不知道为啥这么干？**）
  - **编译器使用“栈逃逸”机制将局部变量的空间分配在堆上。**

```go
func sum(a, b int) *int {
    sum := a + b
    return &sum // 允许，sum会被分配到堆上
}
```

- 指针传值（引用传递）

```go
func swap(a, b int) {
    a,b = b,a
    fmt.Println(a,b) // 2,1
}

func swap2(a, b *int) {
    *a, *b = *b, *a
    fmt.Println(*a, *b) // 2,1
}

func main() {
    a := 1
    b := 2
    swap(a, b)
    fmt.Println(a,b) // 1,2
    
    swap2(&a, &b)
    fmt.Println(a,b) // 2,1
}
```

- unsafe.Pointer
  - 是一种指针类型指针，可以包含任意类型变量的类型。类似C语言的void类型指针
  - unsafe.Pointer可以在任何指针类型之间做转换，这绕过了Go的安全机制，是不安全的操作。
```go
i := 10
var p *int = &i
var fp *float32 = (*float32)(unsafe.Pointer(p))
*fp = *fp * 10
fmt.Println(i) // 100
```

### 数组

- Go语言的数组是**长度固定、同类型元素组成的连续序列**。
  - 创建完**长度**就固定了（**定长性**），不可以追加元素。也就是说数组长度必须在声明的时候就提供明确。（**注意：这里是说的长度。所以数组不能追加和删除元素，只能修改元素**）
  - 元素必须相同
  - 不仅逻辑上是连续的，在实际内存分配是也是连续的一整块内存。

```go
var arr [N]T

var arr = [6]int{1,2,3,4,5,6}
len(arr) // 表示数组大小，也就是数组的元素个数
unsafe.Sizeof(arr) // 数组总字节数 6 * 8 = 48 , 8是一个int的大小（这里得看平台）
```

- **数组长度是数组类型的组成部分**，[10]int和[20]int表示不同的类型。长度在声明后就不可以更改了，长度是数组类型的一个内置常量。
  - 也就是说**两个数组只有长度一样且元素类型一样。那么这两个数组类型才是等价的**。

```go
var arr [2]int // 整型数组，元素默认值是0，元素个数是2，但是一般不这么使用，不进行初始化是没有意义的
a := [3]int{1,2} // 指定长度和初始化元素，没有指定初始化的元素使用默认值
a := [...]int{1,2,3} // 不指定长度，但是初始化列表长度是其真实长度
a := [3]int{1:1, 2:2} // 指定总长度，通过索引进行初始化，没有初始化使用默认值
a := [...]int{3:2} // 不指定长度，长度由最后一个索引值确定，注意这里是4，索引值从0开始

// 遍历
a := [...]int{1,2,3}
print("a length is: %d", len(a)) // len(x) 数组长度
for i,v := range a {
    print("{i:%d, v:%d}", i, v)
}
```

- **多维数组**
  最前面的数量表示最外层的元素个数，和其他语言一样

```go
var mArr [2][3][4]int
```

- **值拷贝**：
  从数组定义可以看到，Go语言中，数组类型是一个整体（长度+类型），所以**数组变量表示的是整个数组**。这点与C语言完全不一样，C语言中，数组变量可以表示为指向数组第一个元素的指针。

  所以，**Go数组，无论是参与迭代，还是作为实参传递给函数或方法。传递的方式都是纯粹的值拷贝**。

  而**值拷贝的问题就是开销特别大。**所以在大多数情况下，都是使用切片，而不是数组。

### 切片 （**独特性**）

- 切片 vs 数组：

![图片](/images/feishu/feishu-go-01-423b32/boxcnAMD0zLwCdO6GHPH0fQbdkg.jpg)

可以理解为：切片是去掉了“长度”属性的“数组”。没有了长度的束缚，则就会多出很多灵活性，这也就为“数组”的**可变性**提供了条件。

- 由于数组的定长性和值拷贝。所以Go提供了**切片slice**

- 切片是一种**变长数组**。注意：**切片的长度可以随着元素的增长而增长，但是不会随着元素数量的减少而减少**。

- 底层实现
```go
type slice struct {
    array unsafe.Pointer // 指向数组的指针
    len int // 切片的元素数量
    cap int // 底层数组的容量
}
```

![图片](/images/feishu/feishu-go-01-423b32/boxcnqFDwKHMRNk16xN2lWVOx8c.jpg)

  - 切片底层由数组指针、长度、容量组成。指针指向数组起始下标，长度对应切片中元素个数，容量则是切片起始位置到底层数组结尾的位置。所以切片长度不会超过容量。
  - 从结构中，也可以看到**底层结构中有包含指向数组的指针。所以切片是引用类型，通过切片操作数组，可以减少数组值拷贝的性能问题。**

- 操作
  - 初始化
    - 由数组创建（数组切片化）：指定索引范围左闭右开区间: [a, b)
```go
var array = [...]int{0,1,2,3,4,5,6,7,8,9,10} // 
s1 := array[0:3] // [0,1,2] 不包含索引3
s2 := array[:2] // [0,1]
s3 := array[4:] // [4,5,6] 包含下标4

// 注意这个：3是左侧下标，6是长度的右侧下标，9是容量的右侧下标
// 所以：长度=6，容量 = 9 - 6
s4 := array[3:6:9] // [3,4,5] // 
```

      - 数组切片化的结果就是：切片的底层数组就是当前数组。所以**切片对元素的修改，也将直接影响数组中对应元素的变化 (注意包括append)**。切片的大小、容量都不能超过源数组的大小。同样的，**多个切片对应同一个数组，则对任一一个切片的操作，也会反映到其他切片中**。
        - 所以在Go语言中，数组大多数只是承担底层存储空间的角色。
```go
s1[0] += 11
fmt.Println("array[0] =", arr[0]) // 11
```

    - 内置make函数：make([]Type, len, cap)。使用make来创建的话，底层还是会有一个匿名数组被创建。不知道容量的话，容量和长度是一致的。
```go
a := make([]int, 5) // len和cap都为5的切片
a := make([]int, 2, 5) // len == 2， cap == 5
```

    - 切片零值可用。切片默认零值是nil。但是它在零值的状态下，也可以通过append函数进行操作。这种就叫做“**零值可用**”，对应的map则是零值不可用
  - 函数操作
    - len(x) // 返回len
    - cap(x) // 返回cap
    - **append**(源切片, value) // value可以是切片，切片的话，**必须使用...**
      - append过程中，如果底层数组已经没有空间再来存储追加的值，则Go运行时会对切片进行**扩容操作**。**动态扩容出来的新数组一般是当期数组的2倍**。
      - 但是，如果是由数组切片化生成的切片。一旦追加的数据操作触碰到底层数组容量的上限。**那么切片就会和原数组解绑**，后续对切片的任何修改都不会反应到原数组中了。
```go
arr := [5]int{1,2,3,4,5}

s := arr[0:3]
fmt.Println("arr:", arr) // [1,2,3,4,5]
fmt.Printf("s(l=%d, c=%d): %v\n", len(s), cap(s), s) // s(l=3, c=5): [1 2 3]
s = append(s, 41) // 这里对切片append，也会修改原数组对应下标的值
fmt.Println("arr:", arr) // [1 2 3 41 5]
fmt.Printf("s(len=%d, cap=%d): %v\n", len(s), cap(s), s) // s(len=4, cap=5): [1 2 3 41]
s = append(s, 51)
fmt.Println("arr:", arr) // [1 2 3 41 51]
fmt.Printf("s(len=%d, cap=%d): %v\n", len(s), cap(s), s) // s(len=5, cap=5): [1 2 3 41 51]

s = append(s, 61)  // 这里会脱离绑定关系
fmt.Println("arr:", arr) // arr: [1 2 3 41 51]
fmt.Printf("s(len=%d, cap=%d): %v\n", len(s), cap(s), s) // s(len=6, cap=10): [1 2 3 41 51 61]

s[0] = 11
fmt.Println("arr:", arr) // arr: [1 2 3 41 51]
fmt.Printf("s(len=%d, cap=%d): %v\n", len(s), cap(s), s) // s(len=6, cap=10): [11 2 3 41 51 61]
```

    - copy(a, b) // 将切片b拷贝到a，个数会参照两个切片的**最小len**
```go
var array = [...]int{0,1,2,3,4,5,6}
s := array[:2]
fmt.Println("len:, cap:", len(s), cap(s))
        
s1 := make([]int, 3)
fmt.Println("len:, cap:", len(s1), cap(s1))
s1 = append(s1, s...) // 添加切片。注意：这里一定要...
fmt.Println(s1)

s1 := array[:5] // [0 1 2 3 4]
s2 := make([]int, 2)
s2[0] = 1 // [1] 修改方式和数组一样
s2[1] = 2 // [1,2]
copy(s1, s2) // s1 = [1,2,2,3,4] // 将s2的两个元素替换掉s1的前两个元素
fmt.Println(s1)
```

    - 动态删除。切片的删除实际是没有什么remove函数的。而是通过切片的元素来实现的。
```go
slice3 := []int{1,2,3,4,5,6,7,8,9,10} // 长度是10、容量是10
slice3 := slice3[:len(slice3) - 5] // 删除slice3尾部5个元素：长度是5、容量是5
slice3 := slice3[5:] // 删除前5个元素：长度是0、容量是5
```

      - 也可以使用append、copy等方式，生成新的切片，来达到删除的效果。只是这种不会对原切片产生影响。
```go
slice3 := []int{1,2,3,4,5,6,7,8,9,10}

slice4 := append(slice3[:0], slice3[3:]...) // 删除开头前3个元素
slice5 := append(slice3[:1], slice3[4:]...) // 删除中间3个元素
slice6 := append(slice3[:0], alice3[:7]...) // 删除最后3个元素
slice7 := slice3[:copy(slice3, slice3[3:])] // 删除开拓前3个元素。
```

  - 数据共享问题：
    - 上面说到切片是引用类型。所以赋值和传参都是引用传递。也就是新的变量和旧的都是改变的同一个切片。
```go
slice1 := []int{1,2,3,4,5}
slice2 := slice1[1:3]
slice2[1] = 6

fmt.Println(slice1) // [1,2,6,4,5]
fmt.Println(slice2) // [2,6]
```

    - 解决方案：使用append，处理旧的切片。
      - 这里的append，slice1的容量不足会导致切片内部的数组扩容，而重新分配新的内存。这样新的切片slice2会和旧的切片共享同一个底层数组。
      - 如果把slice1换成make([]int, 4, 5)，则append的时候不会有扩容产生，也就不存在重新分配内存。
```go
slice1 := make([]int, 4) // [0,0,0,0]
slice2 := slice1[1:3] // [0,0]
slice1 := append(slice1, 0) // [0,0,0,0,0] 。
slice1[1] = 2 // [0,2,0,0]
slice2[1] = 6 // [0,6]
```

### Map

- Map是字典，类似swift中的Dictionary

- map[keyType]valueType：key可以是任意**可比较类型**，value是值类型；map本身是**引用类型。map也是无序的。**

- Map底层原理：(TODO: 面试必备)
![图片](/images/feishu/feishu-go-01-423b32/boxcnk4qBaswNH4kJX0u4yEiAYg.png)

  - Go语言中的字典和Redis一样，**底层是通过哈希表实现**的。添加键值对到字典时，实际是将键转成哈希值进行存储，在查找时，也是先将键转化为哈希值去表中查询，从而提高性能。
    - 但是哈希表存在**哈希冲突**，即不同键可能会计算出相同的哈希值。这时候Go会原始键的值是否相等，所以**字典的键必须是支持可比较的**。
  - 键值操作：

- 操作
  - 初始化
    - map是零值不可用的
```go
var m map[string]int 
m["key"] = 1 // 会报错，零值不可用。必须先初始化
```

    - 使用字面量创建
```go
ma := map[string]int{"a": 1, "b": 2}
```

    - 使用默认make函数创建
```go
mp1 = make(map[int]string) // 默认使用容器
mp2 = make(map[int]string, 10) //定长 map，后续超出会自动扩容
mp1[1] = "a"
mp2[1] = "b"
```

  - 操作
    - 通过key访问和更改value。字典查找指定键时，返回两个值：第一个是真实的值，第二个是是否找到的标识。
      - 为什么要这个标识？**因为如果这个key在map中并不存在，我们也会得到一个值，这个值是value元素类型的零值**。
```go
value, ok := map["key"]
if ok {
    fmt.Println(value)
}
```

    - 删除某个键值对，使用delete(mapName, key)。如果键不存在，或者字典未初始化，这个调用也不会有什么副作用。
    - len获取键值对数量
    - 使用range遍历
```go
mp := map[string]int{"a": 1}
mp["b"] = 2
fmt.PrintLn(mp["a"])
mp["c"] = 3
fmt.PrintLn(len(mp))
for k, v := range mp {
    fmt.PrintLn("key = ", k, "value=", v)
}
delete(mp, "b")
fmt.PrintLn(mp)
```

- 注意：
  - **Go内置的map不是并发安全的，并发安全的map可以使用标准包sync里的map**；
  - 不能直接修改map某个value的某个元素的值，如果修改完后，**必须将原有value替换**掉。
```go
type User struct {
    name string
    age int
}

mp := make(map[int]User)
andy := User{
    name: "andy",
    age: 18,
}
mp[1] = andy
andy.age = 19
mp[1] = andy // 必须这样整体替换。因为是深拷贝。
```

### 结构体

- goto : [Go语言04——面向对象01](https://bhhbdrz3p9.feishu.cn/docx/LEEMdxxmEotufcxqIBHc0lD9nAh)

### 接口

- goto: [Go语言05——接口](https://bhhbdrz3p9.feishu.cn/docx/BZArdZXJAohESOxAwO1cAoQwnDd) 

### 通道

- TODO

### 类型强制转换

- Go语言中，定义一种新的类型使用 **type** 关键字：
```go
type T S // 新类型T

// 比如
type T1 int
type T2 T1
```

  - 如果一个新类型是基于Go原生类型来定义的，我们就称这个原生类型为新类型的**底层类型**。比如上述代码中，T1的底层类型就是int。
  - 如果一个新类型不是基于Go原生类型定义的。那么这个新类型的底层类型和它对应的类型的底层类型一致。比如上述代码中，T2的底层类型 和 T1的一致，也就是int。

- var a T = (T)(b)  类似C语言的转换格式。

- **拥有相同底层类型的两个类型，他们的变量就可以进行显示转换，然后相互赋值**。

- 取别名：则是完全等价的两个类型。（和定义新类型不一样）
```go
type T = S
```

## 控制结构

程序指令都是**线性地存放在存储器上，所以程序运行本质上只有：顺序和跳转**

### 条件if

- 判断条件无需使用()括起来（和swift一样）

- { 与 if 语句同一行，不能另起一行。（和标准的语法规则）
  - **注意：Go语音房没有三目运算符**（**TODO：为啥？得确认一下**）

```go
if x <= y {
    return y
} else {
    return x
}

return x <= y ? x : y // Go语言没有这种语句
```

- if后面可以带一个简单的初始化语句，并以分号分割，该语句声明的变量的作用域是整个if语句块，包括后面的else if 和 else 分支。（**独特性**）
  - 注意：因为Go可以多重赋值，所以，**建议这个初始化语句尽量简单**，或者直接在if之前使用。

```go
if x := f(); x < y {
    return x
} else if x > z {
    return z
} else {
    return y
}

// 不建议这种写法
if err,file := os.Open("xx"); err == nil {
    defer file.Close()
} else {
    return nil, err
}
// 这里开始就不能使用 err,file 了

// 建议
err,ile := os.Open("xx"
if err != nil {
    return nil, err
}
defer file.Close()
```

### 条件switch

- switch和if一样，可以带一个简单的初始化语句（**独特性**）

- switch支持相等、比较运算的类型变量。（和swift一样）

```go
switch x = a + b; x { // 可以放初始化语句
case x >= 90:
    grade = 'A'
case x >= 80:
    grade = 'B'
    fallthrough // 一定会执行下一个case，忽略下一个case的判断条件
case x >= 70:
    grade = 'C' 
default: // default可以在任意位置（但是不建议这样写哈）
    grade = 'F'
case x >= 60:
    grade = 'D'
}
```

- 通过**fallthrough**语句来强制执行下一个case子句

### 循环语句for

- Go语言只支持for循环，**不支持while循环**（独特性）

- for语句
  - 方法1：for init; condition; post { }  （和C语言一样）
  - 方法2：for condition {} （和Swift语言一样, 类似于while(xx) { } ）
  - 方法3：for { } ，这个类似于while(1) { } 是一个死循环
  - for - range 循环： 对数组、切片、字符串、map、通道等复合数据类型的访问
```go
for x := 1; x < 10; x++ {
    fmt.Println(x)
}

x := 1
for x < 10 {
    fmt.Println(x)
    x++
}

// 只遍历下标
for i := range arr {
    fmt.Println("i", i)
}

// 只遍历元素值
for _, v := range arr {
    fmt.Println("v:", v)
}

// 下标和元素值一起遍历
for i,v := range array {
    fmt.Println("i:",i, "v:", v)
}

for k,v := range mapStru [
    fmt.Println("k:",k, "v:", v)
}

var s = "中国人"
for i,v := range s {
    fmt.Printf("%d %s 0x%x\n", i, string(v), v)
}

// 0 中 0x4e2d
// 3 国 0x56fd
// 6 人 0x4eba
```

  - for-range循环中，**参与循环的是range表达式的副本。所以如果在range中对数组进行修改，不会对原数组有什么影响。**
```go
package main

import "fmt"

func main() {
    var a = [5]int{1,2,3,4,5}
    var r [5]int
    
    fmt.Println("original a=", a) // [1 2 3 4 5]
    
    for i,v := range a {
        if i == 0 {
            a[1] = 12
            a[2] = 13
        }
        r[i] = v
    }
    
    fmt.Println("after for ange loop, a=", a) // [1 12 13 4 5]
    fmt.Println("after for ange loop, r=", r) // [1 2 3 4 5]
    
    var a2 = [5]int{1,2,3,4,5}
    var r2 [5]int
    fmt.Println("original a2=", a2) // [1 2 3 4 5]
    for i,v := range a2[:] { // 数组切片化，对切片的操作会反映到底层源数组中
        if i == 0 {
            a2[1] = 12
            a2[2] = 13
        }
        r2[i] = v
    }
    
    fmt.Println("after for ange loop, a2=", a2) // [1 12 13 4 5]
    fmt.Println("after for ange loop, r2=", r2) // [1 12 13 4 5]
}
```

  - for-range对map中元素的访问是随机的。也就是说虽然我们是从0开始遍历字典，但是遍历的元素不一定是第一个
```go
package main

import "fmt"

func main() {
    var m = map[string]int {
        "tony": 21,
        "tom": 22,
        "jim": 23,
    }

    counter := 0
    for k, v := range m {
    // tony是第一个元素，即使这里删除了，下面还是可以打印出来的
    // 如果tony不是遍历的第一个元素，则第一次循环就删掉了，所以后续k,v里就没有了
        if counter == 0 { 
            delete(m, "tony")
        }
        counter++
        fmt.Println(k,v)
    } 

    fmt.Println("counter is ", counter)
}

```

### 跳转语句

#### goto和标签（**独特性，少用**）

- goto语句可以跳转至标签位置

```go
Label： statement

goto Label
```

- goto用于函数内部的跳转，需要配合标签一起使用

- goto label是指跳转到label标签后一行的语句开始执行
  - goto只能在函数内部跳转
  - goto语句不能跳过内部变量声明语句
  - goto只能跳到同层作用域或上下一层

#### Break中断

- break单独使用，和swift一样。跳出循环过程

- 和标签一起使用，标签和break必须同一函数

```go
l1：
    for i := 0; i+= {
        break li
    }
```

#### continue

- 跳出本次for循环的迭代；

- 也可以和标签一起使用，像上诉的break一样、


