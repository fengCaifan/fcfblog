---
title: "Go语言04——面向对象&类型嵌入"
date: "2023-02-19"
category: "后端与 Go"
tags: ["Go"]
description: "Go面向对象编程设计 面向对象的3大特性：封装、继承、多态。 封装： 类把自己的数据和方法只让可信的类或者对象操作，对不可信的进行信息隐藏。 继承：子类继承父类。 多态： 同一个方法在不同情况下有不同的表现方式，叫做多态"
feishu_token: "LEEMdxxmEotufcxqIBHc0lD9nAh"
---

# Go语言04——面向对象&类型嵌入

## Go面向对象编程设计

- 面向对象的3大特性：封装、继承、多态。
  - 封装： 类把自己的数据和方法只让可信的类或者对象操作，对不可信的进行信息隐藏。
  - 继承：子类继承父类。
  - 多态：**同一个方法在不同情况下有不同的表现方式，叫做多态**。
    -  比如允许将子类类型的指针赋值给父类类型的指针，调用的就是子类的方法，传的是父类类型的指针调用的就是父类的方法。
    - 另外还有有两种方式，**覆盖和重载**。覆盖和重载的区别在于，覆盖在运行时决定，重载是在编译时决定。
    - 类对接口的实现，也是多态的使用场景。相同的接口，不同的类有不同的实现。

- **Go语言并没有沿袭传统的面向对象编程的概念**。比如类的继承、接口的实现、构造函数、析构函数、this指针等。也没有private、public、protect等访问权限。

## Go类型系统

- 类型系统是指一个语音的类型体系结构。
  - 基本类型：byte、int、bool、float、string等；（值类型）
  - 复合类型：数组（值类型）、切片（引用类型）、字典（引用类型）、指针（引用类型）、结构体（值类型）等；
  - 可以指向任意对象的类型：Any类型；
    - Any类型就是空接口，即interface{}。
  - 值语义和引用语义；
    - 也就是值类型和引用类型
  - 面向对象
  - 接口
  - 通道（引用类型）

## 结构体

- 定义一个结构体类型，和之前用到的：定义一个新类型的语法一样，使用type 关键字

```go
type T struct {
    Field1 T1
    Field2 T2
    ...
    FieldN Tn
}
```

- struct结构中的类型可以是任意类型

- struct的存储空间是连续的。其字段按声明的顺序存放（字段自己有对齐要求）（字段对齐一直没怎么学好）。但是**结构体中的字段排序，最好按字节数做升序或降序排列**。

### 初始化

- 注意：
  - 1、**初始化的时候，每个属性后面都应该使用,**；
  - 2、**结构体声明的时候，无需使用,分割开**。
  - 3、在结构体T中，不允许包含类型为T的字段。比如：
```go
// 自递归 报错
type T struct {
    t T
}

// 相互递归 报错
type T1 struct {
    t2 T2
}

type T2 struct {
    t1 T1
}
```

    - 如果要实现这种方式，只能拥有自身类型的指针类型，比如：
```go
type Node struct {
    next *Node
}
```

    - 原因就是：**结构体本身占用内存大小是固定的。如果结构体直接嵌结构体，则在计算该结构体占用内存的时候，就会陷入死循环。而指针（无论是什么类型的指针）的大小其实都是一个int类型的大小（4字节或8字节，跟系统有关）。因此可以嵌套自身类型的指针类型**。

### 空结构体

```go
type Empty struct{} // 定义一个空结构体。内存占用为0。
```

- 空结构体类型，表示没有任何属性和成员方法的空结构体，该类型的实例只有一个。这个值在Go程序中永远只有一份，并且占据的内存空间是0

- 在并发编程中，将通道作为传递简单信号介质，使用struct{}类型声明最好。

## **类**的定义与初始化

### **类的声明**

- Go语言的**类**没有像其他编程语言一样，有class、extends、implements等关键字。而是单纯借助**结构体**来实现**类的声明**：
  - 其实不存在类的说法，它就是结构体，没有类。
```go
type Student struct{
    age int
    name string
}
```

### **初始化**

- Go语言的类不支持构造函数和析构函数。可以通过**定义NewXXX这样的全局函数**来作为**类的初始化函数:**
```go
func NewStudent(age int, name string) *Student {
    return &Student{age: age, name: name}
}

func main() {
    student := NewStudent(1, "fcf")
    fmt.Println(student)
}
```

### **类定义成员方法（值方法、指针方法）**

这节内容可以优先参考[Go语言02——函数和方法](https://bhhbdrz3p9.feishu.cn/docx/I1wsdjX2GoVmblx9SFwc1hpdnkf) 中的**方法集合**和**receiver**原则。

- Go语言没有class这种代码块。所以要给**类定义成员方法**，是**通过在函数签名中添加receiver接收者声明的方式来确定函数归属**。这个时候函数就不再是普通函数，而是成员方法。（这种方式和OC底层实现很像）
```go
func (s Student)GetName() string {
    return s.name
}

func (s *Student)SetName(name string) {
    s.name = name
}

fmt.Println(student.GetName()) // fcf
student.SetName("小明")
fmt.Println(student.GetName()) // 小明
```

  - **值方法**：函数签名中，接收者类型为值类型的方法就是值方法；**指针方法**：函数签名中，接收者类型为指针类型的方法叫做指针方法。二者的区别是：**值方法传入的是结构体实例的值拷贝，修改不会作用到外部传入的结构体实例**。
  - 值方法和指针方法的区别：（**面试必考**）
    - 1、**值方法可以通过指针和值类型实例调用**，指针类型调用值方法会**自动解引用**；
    - 2、**指针类型只能通过指针类型实例调用**。但是有一个例外，如果**值类型是可寻址的**（或者说**左值**），那么编译器会在值类型实例调用指针方法时自动插入取地址符，使得此情形下**值类型可以调用指针方法**。
      - 左值：指可以出现在赋值等号左边的值。
      - 右值：只能出现在赋值等号右边，比如函数返回值、字面量、常量。
      - **左值可寻址，右值不可寻址**。
    - 3、**指针方法可以修改属性指。值方法则不能**。
```go
package main

import "fmt"

type Student struct{
    age int
    name string
}

func NewStudent(age int, name string) *Student {
    return &Student{age: age, name: name}
}

func NewStudent2(age int, name string) Student {
    return  Student{age: age, name: name}
}

func (s Student)GetName() string {
    return s.name
}

func (s *Student)SetName(name string) {
    s.name = name
}

func main() {
    s := NewStudent(10, "fcf1") // 指针类型
    s.SetName("小明1")    // ok 正常调用，指针类型调用指针方法
    fmt.Println(s.GetName()) // ok 正常调用，指针类型调用值方法。实际是(*s).GetName()
    
    s2 := NewStudent2(20, "fcf2") // 值类型
    s2.SetName("小明2") // ok，正常调用，值类型调用指针方法，s2是左值，实际是(&s2).SetName("小明")
    fmt.Println(s.GetName()) // ok，正常调用，值类型调用值方法
    
    NewStudent(30, "fcf3").SetName("小明3") // ok,正常调用，指针类型调用指针方法
    // NewStudent2(40, "fcf4").SetName("小明4") // err, 值类型不能直接调用指针方法
}
```

  - **怎么选择使用值方法还是指针方法？当以下情形时，使用指针方法**：
    - 1、**数据一致性：**方法需要**修改传入的类型实例本身**
    - 2、**方法执行效率**：值方法调用一定会产生**值拷贝**，而大对象拷贝代价很大。

## **类**的继承与方法重写

### 封装

- Go语言没有class这种代码块。上面说到，函数是通过声明接收者，来确定是什么类的成员方法

- Go语言也没有private等权限关键字

- 所以综上：Go语言可以说是没有封装性。但是我们通过定义接收者，来做到封装的效果。

### 继承

- Go语言没有提供继承相关的语法实现。而是通过**组合**间接实现类似功能。
  - 显示继承的弊端：
    - 1、导致类层级越来越复杂
    - 2、影响了类的扩展

- **组合：就是将一个类型嵌入到另一个类型，从而构建新的类型。****相当于父类作为子类的属性**
```go
package main

import "fmt"

type Animal struct {
    Name string
}

func (a Animal) Call() string {
    return "动物的叫声..."
}

func (a Animal) FavorFood() string {
    return "爱吃的食物..."
}

func (a Animal) GetName() string {
    return a.Name
}

// 这个组合就相当于Dog继承了Animal
type Dog struct {
    Animal
}

func main() {
    animal := Animal{"中华田园犬"}
    dog := Dog{animal}
    fmt.Println(dog.GetName()) // 
    fmt.Println(dog.Call()) // 直接调用父类方法
    fmt.Println(dog.FavorFood()) // 直接调用父类方法
}
```

- 多继承
  - 通过多种组合来实现多继承。如果组合的不同类型实现了同名方法，而子类没有重写该方法。则使用实例直接上报的话，会报错，而是要显示调用。
```go
type Pet struct {
    Name string
}

func (p Pet) GetName() string {
    return a.Name
}

// 这样组合，相当于Dog同时继承了Animal和Pet
type Dog struct {
    Animal
    Pet
}

// 
fmt.Println(dog.GetName()) // 这样会报错，因为不知道是调用哪个类的方法
// 
fmt.Println(dog.Pet.GetName()) // 必须这样调用
```

- **继承指针类型的属性和方法**
  - 结构体本身是值类型，所以如果传入值字面量的话，实际传入的是结构体副本，对内存耗费更大，所以**组合指针类型性能更好**。
```go
type Dog struct {
    *Animal
}
```

  - 另外指针类型的函数，使用值类型调用的话，如果能满足左值概念的话，也是可以的。所以使用起来不会有太大的差别
```go
func (a *Animal) SetName(name string) {
        a.Name = name
}

func main() {
    animal := Animal{"中华田园犬"}
    dog := Dog{animal}
    fmt.Println(dog.GetName())
    
    animal.SetName("中华田园犬2")
    dog.Animal = animal
    fmt.Println(animal.GetName())
    fmt.Println(dog.GetName())
}
```

### 多态

- 方法重写

```go
func (a Dog) Call() string {
    return "汪汪汪"
}

func (a Dog) FavorFood() string {
    return "骨头"
}

fmt.Println(dog.Animal.Call())
fmt.Println(dog.Call())
fmt.Println(dog.Animal.FavorFood())
fmt.Println(dog.FavorFood())
```

### 其他：

上面组合，我们看到的类型都是直接使用类名。其实也可以像成员变量一样，使用别名。这样调用的时候就方便很多。

```go
type Dog struct {
    animal *Animal
}
```

**总结：组合发方式更加灵活，不用考虑单继承还是多继承。想要继承哪个类型的方法，直接组合进来就好了。**

## 类属性和成员的可见性

- Go语言没有private这种权限关键字。它的可见性是以包为维度的。

- 不管是是变量、函数、还是类的属性、成员方法。可见性都是根据首字母的大小来决定的。大写可以在包外访问，小写只能在包内访问。

## 类型嵌入

上面说的继承等，其实是一个伪命题，只是站在面向对象的角度去学Go语言。其实**Go语言是不支持经典的面向对象编程范式的**。

Go其实是推崇**组合**的设计思想。组合是通过**类型嵌入**来实现的。

类型嵌入就是在一个类型定义中嵌入其他类型。Go语言支持两种类型嵌入，分别是**接口类型的类型嵌入**和**结构体类型的类型嵌入**。

### 接口类型的类型嵌入

- 如果一个接口中的方法集合包含了另一个接口的所有方法集合，则就可以将类型嵌入进去。比如下面代码。I和I2其实是等价的。
  - 接口类型的类型嵌入的本质就是：**嵌入类型的方法集合并入到新接口类型的方法集合中，且接口类型只能嵌入接口类型**。

```go
type E interface {
    M1()
    M2()
}

type I interface {
    M1()
    M2()
    M3()
}

type I2 interface {
    E
    M3()
}
```

### 结构体类型的类型嵌入

结构体类型的类型嵌入和接口是类似的。

```go
type T1 int
type t2 struct {
    n int
    m int
}

func (t *t2)M2() {}

type I interface {
    M1()
}

type S1 struct {
    T1
    *t2
    I
    a int
    b string
}

var i I
s1 = S1{
    T1 : 1,
    t2 : t2 {
        n: 1,
        m: 2
    },
    I: i,
    a: 1,
    b: 2,
}

s1.M1()
s1.M2()
```

上述代码中，T1、t2、I都是嵌入类型。它在这里**既代表字段名字，也带代表字段类型**。

这些字段，也叫做“**嵌入字段**”。它们的可见性与嵌入类型的可见性（大小写）是一致的。

- 结构体类型嵌入接口类型：
  得到的结论就是结构体类型的方法集合，包含嵌入的接口类型的方法集合。

  - 如果一个结构体T嵌入的两个接口类型E1和E2的方法集合存在交集，则直接嵌入会报错。解决方案：
    - 1是消除这种交集
    - 2是为T增加对交集方法的具体实现，这样的话，编译器便会选择T自己实现的交集方法。
  - 结构体类型嵌入接口类型，可以简化单元测试。（TODO）

- 结构体类型嵌入结构体类型：
  - 当结构体类型T包含嵌入字段E时，*T的方法集合不仅包含类型E的方法集合，还包含类型*E的方法集合。
  -  S1的实例可以直接调用M1、M2方法，无需通过嵌入字段。Go编译器发现当前类型本身没有该方法时，就会去对应的嵌入字段内查找是否定义了该方法，如果定义了，就直接调用。实际上这里就s1.M1就相当于s1.i.M1。如下：
```go
type I interface {
    M1()
}

type S struct {
    a int
}

func (S)M2() {}

type S1 struct {
    I
    S
}

s := S{}
s.M1()
s.M2()
```

注意区分：嵌入类型的结构体与非嵌入类型结构体的区别。

下面代码中S1是带有I、S的嵌入类型，S2是不带有I、S的嵌入类型。所以S1的方法列表包含M1、M2；S2的方法列表为空。

```go
type I interface {
    M1()
}

type S struct {
    a int
}

func (S)M2() {}

type S1 struct {
    I
    S
}

// 注意区分下面的结构。这种就不是嵌入。而是正常的成员变量。相当于S2的方法集合里
// 并不含有I和S的方法集合。
type S2 struct {
    I i
    S s
}
```


