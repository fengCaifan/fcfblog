---
title: "Go语言02——函数和方法"
date: "2023-02-19"
category: "后端与 Go"
tags: ["Swift","Go"]
description: "函数 使用 func 作为关键字，main函数代表可执行程序的入口函数。main函数所在的包名必须是main。 函数类型是由：func 参数类型 返回值类型 组成 函数 { 必须与函数名后面，不能单独一行；（正常的编码规"
feishu_token: "I1wsdjX2GoVmblx9SFwc1hpdnkf"
---

# Go语言02——函数和方法

## 函数

- 使用**func**作为关键字，main函数代表可执行程序的入口函数。main函数所在的包名必须是main。

- 函数类型是由：func(参数类型) 返回值类型  组成
```go
func add(a, b int) int {
    return a + b
}

fmt.Println("%T", add) // func(int,int) int
```

- 函数 { 必须与函数名后面，不能单独一行；（正常的编码规范）

- 函数在Go中也是第一等公民（和swift一样）

- 在同一个Go包中，函数名应该是唯一的。

- Go语言的函数：（和swift一样）
  - 函数是一种类型：
    - 可以像其他变量一样使用；
    - 可以作为其他函数的参数或返回值；
    - 可以使用type类定义一个函数类型，可以查看下面匿名函数的笔记
```go
func add(a,b int) int {
    return a + b
}

type OP func(int, int) int

func do(f OP, a, b int) int {
    return f(a, b)
}

func main() {
    a := do(add, 1, 2)
    fmt.Println(a)
}
```

  - 返回值：
    - 支持多个返回值。如果有多个返回值，则需要使用()包裹起来，如果只有一个返回值，则无需（）
    - 返回值可以指定参数名 （独特性）
```go
func add(a,b int) (sum int) {
    sum = a + b
    return //  这里可以省略sum，return sum
}

func add(a,b int) (sum int) {
    sum := a + b // 这里sum相当于被一个新的sum覆盖了， 
    return sum //  所以需要显示地返回sum
}
```

  - 支持闭包
  - 参数
    - 支持不定数量参数
      - 相同类型的不定参数：
        - 不定参数必须是函数的最后一个参数
        - 不定参数的参数名相当于一个切片，定义可以对不定参数进行切片操作，也可以将切片传递给不定参数，但形参为不定参数和形参为切片的函数的函数类型是不一样的
```go
func sum(arr ...int) (sum int) {
    for _, v := range arr {
        sum += v
    }
    return
}

sum(1,2,3,4)
sum(slice[1:3])
```

      - 任意类型的不定参数（泛型）。
        - 通过指定变长参数类型为interface{}。fmt.Printf()的函数就是：
```go
func Printf(format string, args ...interface{}) {
    // ...
}
```

        - 自定义一个print
```go
func myPrint(args ...interface{}) {
    for _, arg := args {
        switch reflect.TypeOf(arg).Kind() {
            case reflect.Int:
                fmt.Println(arg, "is an int value")
            case reflect.String:
                fmt.Println("\"%s\" is an string value", arg)
            case reflect.Array:
                fmt.Println(arg, "is an array value")
            default:
                fmt.Println("unknow type")
        }
    }
}
```

        - Go语言其实并没有泛型。interface{} 是一个**空接口。**可以表示任意类型。所以在实际使用中，需要通过**反射**对数据类型进行检查。
    - 不支持默认值参数 （与swift不一样）
    - Go语言函数传递采用的是**值传递**方式。如果是整型、数组等类型，则是将内容直接拷贝了过去。如果是string、切片、map等类型，传递的是数据内容的描述符（指针），是浅拷贝。所以指针的参数在函数体内发生了改变，实参也会对应改变。
  - 不支持重载： （与swift不一样）
    - 重载是指：函数名相同，参数名;参数类型;参数个数不同
  - 不支持命名函数嵌套。（与swift不一样）

- 函数首字母的大小写决定了该函数在其他包的可见性；（独特性）
  - 大写时其他包可见，小写时只有当前包可以访问。（大写相当于其他语言中的public，小写相当于其他语言的protected、private）

## **defer**

```go
func main() {
    defer func() {
        fmt.Println("defer1")
        }()
    
    defer func() {
        fmt.Println("defer2")
        }()
    
    defer func() {
        fmt.Println("defer3")
        }()
    
    var a = 1
        // 内外对形参的更改不会相互影响
    defer func(a int) {
        a += 1
        fmt.Println("%d", a) // 2
    }(a) // 把a传进去
    
    a += 1
    fmt.Println("%d", a) // 2 
    return
    defer func() {
        fmt.Println("defer4")
        }()
}

// 执行顺序是：defer3、defer2、defer1
```

## 闭包& 匿名函数

### 匿名函数

- 有函数名的，我们称为具名函数，没有函数名的，我们称为匿名函数。匿名函数可以赋值给一个变量，也可以直接执行。

```go
add := func(a, b int) int {
    return a + b
}
// 通过调用变量调用匿名函数
fmt.Println(add(1, 2))

// 定义时，直接调用
func(a, b int) {
    fmt.Println(a + b)
}(1, 2)
```

- 支持匿名函数嵌套。

```go
func add(a,b int) (sum int) {
    add2 := func (x, y int) int {
        return x + y
    }
    return add2(a, b)
}
```

- 匿名函数可以作为参数，也可以作为返回值。

```go
var sum = func (a, b int) int {
    return a + b
}

func doinput(f func(int, int) int, a, b int) int {
    return f(a, b)
}

func wrap(op string) func (int, int) int {
    switch op {
    case "add":
        return func (a, b int) int {
            return a + b
        }
    case "sub":
        return func (a, b int) int {
            return a - b
        }
    default:
        return nil
    }
}

func main() {
    defer func() {
        if err := recover(); err != nil {
            fmt.Println(err)
        }
    }() // 这就相当于直接调用了
    
    sum(1,2)
    
    doinput(func (x, y int) int {
        return x + y
    }, 1, 2)
    
    opFunc := wrap("add")
    re := opFunc(2, 3)
    fmt.Println("%d\n", re)
}
```

### 闭包

**经典讲解**：

所谓闭包，就是指**引用了自由变量**（未绑定到特定对象的变量，通常在函数外定义）的函数，被引用的自由变量将和这个函数一同存在，即使离开了创造它的上下文环境也不会被释放。简单来说，“闭”的意思是“封闭外部状态”，即使外部状态已经失效，闭包内部依然保留了一份从外部引用的变量。

我们可以把闭包看作是**有状态的匿名函数**。反过来说，匿名函数引用了外部变量，就形成了一个闭包。

```go
func main() {
    base := 10
    add := func(a, b int) int {
        return a * base + b
    }
    handleAdd(1,2,add)
}

func handleAdd(a, b int, call func(int, int) int) {
    fmt.Println(call(a, b))
}
```

这个例子可以看到add引用了外部变量base，形成了一个闭包。在调用handleAdd时，传入了add作为参数，add在外部函数handleAdd中执行时，虽然作用域离开了main函数，但是还是可以访问到变量base。

- **闭包是由函数和与其相关的引用环境组合而成的实体。闭包 = 函数 + 引用环境。（引用环境其实是指引入参数）**

以下是一个Go闭包。

```go
func incr() {
    var j int = 1
    f := func() {
        var i int = 1
        fmt.Println("i,j:%d,%d\n", i, j)
    }
    
    f() // i,j: 1, 1
    j += 2
    f() // i,j: 1, 3
}
```

- 虽然写法上与switft有点区别，但是本质上我认为一样的。

- 闭包对外部环境的引入是直接引用，编译器会将闭包引用的外部变量分配到堆上。这里说的外部环境是指入参。

- example1：闭包会持续持有引入的外部变量，但是引入进来的变量已经和外部的实参没有什么关联了（值传递）。同一个闭包的每次调用都是对同一个变量进行操作。

```go
package main

import "fmt"

func fa(a int) func (i int) int {
    return func(i int) int {
                fmt.Println(&a, a)
        a = a + i
        return a
    }
}

func main() {
        a0 := 1
        a1 := 2
        fmt.Println(&a0, a0) // 0xc00001c030 1
        fmt.Println(&a1, a1) // 0xc00001c038 2
        
        f := fa(a0) // 第1个闭包
        g := fa(a1) // 第2个闭包
        
        fmt.Println(f(1)) // 2 闭包内a = 0xc00001c050 1
        
        fmt.Println(g(1)) // 3 闭包内a = 0xc00001c058 2
        fmt.Println(g(2)) // 5 闭包内a = 0xc00001c058 3
        fmt.Println(g(3)) // 8 闭包内a = 0xc00001c058 5
        
        fmt.Println(a0) // 1
        fmt.Println(a1) // 2
}
```

- 同一个函数返回多个闭包。这几个闭包是操作的同一个变量。

```go
func fa2(base int) (func (int) int, func (int) int) {
        fmt.Println(&base, base)
        add := func (i int) int {
                base += i
                fmt.Println(&base, base)
                return base
        }
        
        sub := func (i int) int {
                base -= i
                fmt.Println(&base, base)
                return base
        }
        
        return add, sub
}

func main() {
        a2 := 1
        a3 := 2
        
        fmt.Println(&a2, a2) // a2 0xc0000b2030 1
        fmt.Println(&a3, a3) // a3 0xc0000b2038 2
        
        f1, g1 := fa2(a2) // base 0xc0000b2040 1 新的地址
        s1, k1 := fa2(a3) // base 0xc0000b2048 2 新的地址
        
        // 同一个函数生成的不同闭包，操作的同一个base
        fmt.Println(f1(1)) // base 0xc0000b2040 2 
        fmt.Println(g1(2)) // base 0xc0000b2040 0
        
        // 同一个函数生成的不同闭包，操作的同一个base
        fmt.Println(s1(1)) // base 0xc0000b2048 3
        fmt.Println(k1(2)) // base 0xc0000b2048 1
}
```

- 总结：
  - 1、闭包本身是函数，所以每次调用都是相当于调用了一个函数，也就是分配了一个函数栈内存。闭包赋值给某个变量，也只是这个变量指针指向了这个函数地址而已。应该说和普通调用没什么区别。
  - 2、因为闭包对外部变量的引用会被分配到堆上。所以每次调用同一个闭包，都会对同一个堆内存进行操作。所以重复调用同一个闭包，会重复修改一个值。但是**不会对外包部变量产生影响**。
  - 3、一个函数里，含有多个闭包。则引入的外部变量只会有一个堆内存地址，多个闭包共同使用同一个参数，所以会操作同一个内存地址。

[《Go语言闭包详解》](https://segmentfault.com/a/1190000022798222)

## 函数和闭包底层实现

### 普通函数

- 函数的调用者负责环境准备，包括为参数和返回值开辟空间。

- 寄存器的保存和恢复也由调用方负责。

- 函数调用后回收栈空间，也由主调函数负责。

- 如果函数是多返回值的，则需在栈上开辟多个地址分别存放返回值，如果返回值是存放在堆上，则多了一个复制的动作。

- 函数调用前为返回值和参数分配了栈空间，分配顺序是从右往左，先是返回值，然后是参数。

### 闭包

- 通过汇编可以看到，闭包在Go中和在OC中是一样的性质，就是编译器会将闭包转成一个“包含函数及其上下文的一个结构体对象。”

```go
type Closure struct {
    F uintptr // 匿名函数指针
    env *Type // 对外部环境变量的引用集合。
}
```

- 如果**闭包内没有修改外部变量，则Go编译器直接优化为值传递**。**如果修改了，则是通过指针传递**的。

### 总结：

- 从闭包的编译器优化可以知道。我们调用函数的时候，正常情况下都是值传递。如果要修改实参。则可以改成指针传递。

## 方法

- 方法是相对函数而言的。函数是可以独立存在的，但是**方法是要依赖接收者的，方法必须归属于一个类型**。 这个接收者也就是方法和类型之间的纽带。 方法可以看做是特殊类型的函数。本质就是函数。
```go
// 函数声明
func Test(a,b int) (c int)

// 方法声明: 多了一个函数接受者。
func (srv *Receive)Test(a,b int) (c int)
```

### 方法调用

- 类型方法的一般调用方式(使用.语法)：类型实例.方法名(参数列表)

```go
typeInstanceName.Meethod(ParamsList)
```

- **方法值**
  - 因为函数也是类型。所以调用过程可以看做一个方法值：x.M

- **Go语言方法声明要与接收者的基类型声明放到同一个包内**。
  - 推论1：我们不能为原生类型（比如int）添加方法。
  - 推论2：不能跨越Go包为其他包的类型声明新方法。

### 方法的本质

像C++语言，对象的方法在调用的时候，编译器会自动传入指向对象自身的this指针作为方法的第一个参数。（swift则是self指针）

所以，Go语言的原理其实也是类似。只不过我们是将接收者（receiver）参数以第一个参数的身份并入到方法的参数列表中。

```go
func (t T)Get() int {
    return t.a
}

func Get(t T) int {
    return t.a
}
```

### 方法集合

方法集合是一个类型的所有方法。有的类型没有方法，比如int。

- Go语言规定：***T类型的方法集合包含所有以*T为receiver参数类型的方法，以及所有以T为receiver参数类型的方法。**所以我们从下面Demo中可以看*T包含了4个方法类型。

Demo：

```go
package main

import"fmt"
import "reflect"

// 查看一个类型的方法集合
func dumpMethodSet(i interface{}) {
    dynTyp := reflect.TypeOf(i)
    if dynTyp == nil {
        fmt.Printf("there is no dynamic type\n")
        return
    }
    
    n := dynTyp.NumMethod()
    if n == 0 {
        fmt.Printf("%s 's method set is empty!\n", dynTyp)
        return
    }
    
    fmt.Printf("%s 's method set:\n", dynTyp)
    for j := 0; j < n; j++ {
        fmt.Println("-", dynTyp.Method(j).Name)
    }
    
    fmt.Printf("\n")
}

type T struct {}

func (T) M1() {}
func (T) M2() {}

func (*T) M3() {}
func (*T) M4() {}

func main() {
    var n int
    dumpMethodSet(n)     // 输出：int 's method set is empty!
    dumpMethodSet(&n)    // 输出：*int 's method set is empty!
    
    var t T
    dumpMethodSet(t)
    /* 输出：
     main.T 's method set:
    - M1
    - M2
    */
    
    dumpMethodSet(&t)
    /* 输出：
     *main.T 's method set:
    - M1
    - M2
    - M3
    - M4
    */
}
```

- Go接口interface，其实就是一个方法集合。如果某类型T的方法集合与某接口类型的方法集合相同。我们就说这个类型T显示了该接口。

```go
package main

import (
    "fmt"
    "reflect"
)

// 查看一个类型的方法集合
func dumpMethodSet(i interface{}) {
    dynTyp := reflect.TypeOf(i)
    if dynTyp == nil {
        fmt.Printf("there is no dynamic type\n")
        return
    }
    
    n := dynTyp.NumMethod()
    if n == 0 {
        fmt.Printf("%s 's method set is empty!\n", dynTyp)
        return
    }
    
    fmt.Printf("%s 's method set:\n", dynTyp)
    for j := 0; j < n; j++ {
        fmt.Println("-", dynTyp.Method(j).Name)
    }
    
    fmt.Printf("\n")
}

type Interface interface {
    M1()
    M2()
}

type T struct {}
func (t T) M1() {}
func (t *T) M2() {}

func main() {
    var t T
    var pt *T
     dumpMethodSet(t)
     /* 输出
     main.T 's method set:
    - M1
     */
     dumpMethodSet(pt)
     /* 输出
    *main.T 's method set:
    - M1
    - M2 
     */
     
     var i Interface
     i = pt
     i = t // 这里会报错：
     /*cannot use t (variable of type T) as 
     Interface value in assignment:
     T does not implement Interface
      (method M2 has pointer receiver)*/
}
```

### receiver类型

上述说到方法，会多一个接收者receiver类型。但是我们发现一般receiver都可能会有指针类型和非指针类型。

```go
func (t T)M1() {}

func (t *T)M2() {}
```

- 非指针类型：

非指针类型，则说明Go函数的receiver类型采用的是值拷贝传递，也就是说函数中的t是T类型的一个副本，对t的任何修改都不会影响原T类型的实例。

- 指针类型：

指针类型的话，那传递过去的是T类型实例的地址，所以对t的任何修改都会反应到原T类型的实例上。

```go
package main

import"fmt"

type T struct {
    a int
}

func (t T) M1() {
    t.a = 10
}

func (t *T) M2() {
    t.a = 11
}

func main() {
    var t T
    fmt.Println(t.a) // 0
    
    t.M1()
    fmt.Println(t.a) // 0 ,非10
    
    (&t).M2()
    fmt.Println(t.a) // 11
}
```

- 综上所述，如何**选择receiver的类型**。
  - **原则1：如果在函数中想对类型实例进行修改，则应该使用指针类型，因为指针类型引用传递，修改才能反馈到原实例上**。
  - **原则2**：如果在函数中只是对实例进行访问，没有修改。通常情况下是使用非指针类型。但是由于**非指针类型的传递方式是值传递**，所以如果receiver参数类型的size较大时，为了避免**性能开销过大**，**也可以考虑使用指针类型**会更好些。
  - 原则3：从上面方法集合中可以看到，***T 的方法集合是包含T方法集合的。如果T类型需要实现某个接口，那就要使用T类型作为receiver的类型**。
  代码设计的时候，首先应该考虑原则3,然后再参考原则1和原则2。

- **实例类型选择（**语法糖）
  对于上述Demo，方法调用修改一下。发现得到的结果没有任何变化。

  原因是：

  **Go编译器会根据Receiver的类型对实例进行自动转换**。比如：如果是指针类型的方法，它会将非指针类型的实例转换成指针类型：t1.M2() ——> (&t1).M2()；同样的，会将指针类型转成非指针类型：t2.M1() ——> (*t2).M1()。

  所以：**无论是T类型实例还是*T列席实例，既可以调用receiver为T类型的方法，也可以调用receiver为*T类型的方法**。

```go

func main() {
    var t1 T
    fmt.Println(t1.a) // 0
    t1.M1()
    fmt.Println(t1.a) // 0
    t1.M2()
    fmt.Println(t1.a) // 11
    
    var t2 = &T{}
    fmt.Println(t2.a) // 0
    t2.M1()
    fmt.Println(t2.a) // 0
    t2.M2()
    fmt.Println(t2.a) // 11
}
```

  

上述格式，也可以改成，将类型作为第一个参数。二者是等价的。这个方式，应该是编译器底层处理的结果。这种是面向过程风格，OC底层也是转成这样。只是使用过程中，第一个参数由编译阶段完成。

```go
// 类型方法接收者是值类型
func MethodName(t TypeNamee, ParamList) (ReturnList) {
    ....
}

// 类型方法接收者是指针
func MethodName(t *TypeName, ParamList) (ReturnList) {
    ....
}
```


