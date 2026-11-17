---
title: "Go语言06——类型推断、反射、泛型"
date: "2022-12-11"
category: "后端与 Go"
tags: ["Go"]
description: "类型推断 Go语言没有类型推断关键字，而是通过断言运算符 . type 来实现，其中type对应的就是要断言的类型。 类型推断 Go语言通过num3, ok := num2. Number2 表达式断言num2是否是Nu"
feishu_token: "DHBPdFuy1orowfxqOJtcslx0nPc"
---

# Go语言06——类型推断、反射、泛型

## 类型推断

Go语言没有类型推断关键字，而是通过断言运算符 **.(type) **来实现，其中type对应的就是要断言的类型。

### 类型推断

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

if num3, ok := num2.(Number2); ok {
    fmt.Println(num3.Equal(1))
}
```

- Go语言通过num3, ok := num2.(Number2)表达式断言num2是否是Number2类型的实例。如果是ok为true，如果不是，ok为false。

- 另外**类型推断是否成功需要在运行期才能够确定**。

- **结构体和接口类型推断**是一样的语法。

### 基于反射动态断言类型

- 反射参考下面内容

- 除了上面的类型推断，还可以通过基于反射在运行时动态进行类型断言。使用**reflect包提供的TypeOf函数**即可实现。

```go
import "reflect"

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

- 对于基础数据类型，int、string、bool，则不必通过反射，直接使用**varibale.(type)表达式**即可获取**variable变量**对应的额类型值

```go
func myPrintf(args ...interface{}) {
    for _, arg := range args {
        switch arg.(type) {
        case int:
            fmt.Println(arg, "is an int value")
        case string:
            fmt.Println("\"%s\" is an string value", arg)
        case bool:
            fmt.Println(arg, "is an bool value")
        default:
            fmt.Println(arg, "is an unknow value")
        } 
    }
} 
```

### 使用空接口实现灵活的类型推断

- 因为空接口可以表示任意类型，所以在做类型推断时，可以基于空接口将其他类型变量转化成空接口类型。

## 反射

- **reflect**包提供**反射**相关的API，reflect最常用、最重要的类型就是reflect.Type（变量的类型）和reflect.Value（变量的值）。分别可以通过reflect.TypeOf和reflect.ValueOf函数获取。

```go
package main

import (
        "fmt"
        "reflect"
)

type Animal struct {
    Name string
}

func NewAnimal(name string) Animal {
    return Animal{Name: name}
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

type Pet struct {
    Name string
}

func NewPet(name string) Pet {
    return Pet{Name: name}
}

func (p Pet) GetName() string {
    return p.Name
}

// 这样组合，相当于Dog同时继承了Animal和Pet
type Dog struct {
    animal *Animal
    pet Pet
}

func NewDog(animal *Animal, pet Pet) Dog {
    return Dog{animal: animal, pet: pet}
}

func (a Dog) Call() string {
    return "汪汪汪"
}

func (a Dog) FavorFood() string {
    return "骨头"
}

func main() {
    animal := NewAnimal("中华田园犬")
    pet := NewPet("泰迪")
    dog := NewDog(&animal, pet)
        fmt.Println("dog name:", dog.animal.GetName())

    // 通过反射获取实例的类型
    dogType := reflect.TypeOf(dog)
    fmt.Println("dog type:", dogType) // dog type: main.Dog
    
    // 通过反射获取实例的值
    dogValue := reflect.ValueOf(dog)
    fmt.Println("dog value:", dogValue) // dog value: {0xc000014250 {泰迪}}
}
```

- 通过反射来获取变量的所有未知结构信息，并动态进行调用。

```go
// 获取dogValue的所有属性
fmt.Println("================Props===============")
for i := 0; i < dogValue.NumField(); i++ {
    // 获取属性名
    fmt.Println("name:", dogValue.Type().Field(i).Name)
    // 获取属性类型
    fmt.Println("type:", dogValue.Type().Field(i).Type)
    // 获取属性值
    fmt.Println("value:", dogValue.Field(i))
}

// 获取dogValue所有方法
fmt.Println("================Methods===============")
for j := 0; j < dogValue.NumMethod(); j++ {
    // 获取方法名
    fmt.Println("name:", dogValue.Type().Method(j).Name)
    // 获取方法类型
    fmt.Println("type:", dogValue.Type().Method(j).Type)
    // 调用该方法
    fmt.Println("exec result:", dogValue.Method(j).Call([]reflect.Value{}))
}

// 结果：
================Props===============
name: animal
type: *main.Animal
value: &{中华田园犬}
name: pet
type: main.Pet
value: {泰迪}
================Methods===============
name: Call
type: func(main.Dog) string
exec result: [汪汪汪]
name: FavorFood
type: func(main.Dog) string
exec result: [骨头]
```

- 我们可以通过反射获取变量的所有未知结构信息。

- 反射是在运行时而非编译期间进行，所以有一定风险。

## 泛型

- Go并未在语法层面对泛型进行支持。但是可以通过空接口结合反射来实现。但是空接口interface{}是可以表示任何类型，因此它就是一个泛型。

- 但是空接口这个泛型太泛了，所以必须**结合反射在运行时对实际传入的参数做类型检查，让泛型变得可控**，从而确保程序的健壮性，否则**很容易因为传递进来的参数不合法导致程序崩溃**。

- 实现一个泛型容器

```go
package main
import (
    "fmt"
    "reflect"
)

type Container struct {
    s reflect.Value
}

// 通过传入存储元素类型和容量来初始化容器
func NewContainer(t reflect.Type, size int) *Container {
    if size <= 0 {
        size = 64
    }
    // 基于切片类型实现这个容量，这里通过反射动态初始化这个底层切片
    return &Container{s: reflect.MakeSlice(reflect.SliceOf(t),0,size)}
}

// 添加元素到容器，通过空接口声明传递的元素类型，表明支持任何类型
func (c *Container) Put(val interface{}) error {
    // 通过反射对实际传递进来的元素类型进行运行时检查
    // 如果与容器初始化时设置的元素类型不同，则返回错误信息
    // c.s.Type() 对应的是切片类型，
    if reflect.ValueOf(val).Type() != c.s.Type().Elem() {
        return fmt.Errorf("put error: cannot put a %T into a slice of %s", val, c.s.Type().Elem())
    }
    // 如果类型检查通过则将其添加到容器中
        c.s = reflect.Append(c.s, reflect.ValueOf(val))
    return nil
}

// 从容器中读取元素，将返回结果赋值给val，同样通过空接口指定元素类型
func (c *Container) Get(val interface{}) error {
    // 通过反射对元素类型进行检查，如果不通过则返回错误信息
    // Kind与Type相比范围更大，表示类别，如指针，而Type则对应具体类型，如 *int
    // 由于val是指针类型，所以需要通过reflect.ValueOf(val).Elem()获取指针指向的类型
        if reflect.ValueOf(val).Kind() != reflect.Ptr || 
        reflect.ValueOf(val).Elem().Type() != c.s.Type().Elem() {
        return fmt.Errorf("get error: needs *%s but got %T ", c.s.Type().Elem(), val)
    }
    // 将容器的第一个索引位置赋值给val指针
    reflect.ValueOf(val).Elem().Set(c.s.Index(0))
    // 然后删除容器的第一个索引位置
    c.s = c.s.Slice(1, c.s.Len())
    return nil
}

func main() {
    nums := []int{1,2,3,4,5}
    // 初始化容器
    c := NewContainer(reflect.TypeOf(nums[0]), 16)
    
    // 添加元素到容器
    for _,n := range nums {
        if err := c.Put(n); err != nil {
            panic(err)
        }
    }
    
    // 从容器读取元素，将返回结果初始化为0
    num := 0
    if err := c.Get(&num); err != nil {
        panic(err)
    }
    
    fmt.Printf("%v (%T)\n", num, num)
}
```


