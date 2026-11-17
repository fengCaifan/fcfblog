---
title: "Go语言08——并发编程"
date: "2023-03-12"
category: "后端与 Go"
tags: ["多线程与并发","性能与稳定性","设计模式","Go"]
description: "多进程、多线程、协程 原理 并发VS并行 串行：就是指代码按顺序执行。 问题：遇到耗时的操作，就会出现等待。 并行：是指通过 CPU多核能力 同时处理多个任务，每个任务分配给单独处理器执行，同一时间点，任务是同时执行的。"
feishu_token: "UZLPdQJalo5PcOxPQsZcuqwCnkh"
---

# Go语言08——并发编程

## 多进程、多线程、协程

### 原理

#### 并发VS并行

- 串行：就是指代码按顺序执行。
  - 问题：遇到耗时的操作，就会出现等待。

- 并行：是指通过**CPU多核能力**同时处理多个任务，每个任务分配给单独处理器执行，同一时间点，任务是同时执行的。

- 并发：侧重于单核CPU中，通过CPU的时间分片实现任务的交替执行，由于CPU上下文切换很快，给用户的感觉和多个任务同时执行没什么区别。

总结：

#### 多进程

- 系统层面上的并发模式，通常像iOS手机，**一个应用就是一个单独的进程。进程是操作系统中资源拥有的基本单元，它不仅包含应用的代码和数据，还有系统级的资源，比如文件描述符、呢诶村地址空间等**。

#### 多线程

- 线程是在进程的基础上的，一般一个进程会有一个或多个线程组成。线程比进程轻量，线程间可以共享数据。

- 但是线程间切换和管理也是会产生消耗性能。所以在高并发模式下，效率会有影响。比如C10K问题（1万个并发连接需要1万个线程）。

#### 基于回调的非阻塞/异步IO

- 为了解决C10K问题，在很多高并发服务器开发实践中，会通过事件驱动的方式使用异步IO。在这种模式下，一个线程可以维护多个Socket链接，从而降低系统开销，保持服务器的持续运转。

- Nginx就是这种模式。但是编程非常复杂

#### 协程

- 本质上是一种用户态线程，可以看作是轻量级的线程。不需要操作系统进行抢占式调度，系统开销极小。

- 优点：编程简单、结构清晰

- 缺点：需要语言级别的支持，否则需要自己实现相应调度器。

### 优略

#### 传统并发模式缺陷

- 进程缺陷：进程比较消耗系统资源，且进程间数据隔离，CPU切换成本高。

- 多线程缺陷：假设有一个主线程，两个异步子线程。
  - 不知道主线程执行完毕的时候，子线程是否执行完毕。如果主线程执行完毕退出应用，可能导致新线程的中断。
  - 如果两个子线程有相互依赖的变量，甚至出现死锁。如何在主线程中获取新线程的异常和错误信息并进行相应处理？这些都使得程序变得不可控。
  - 线程间通讯可以通过**共享内存**的方式，即不同线程中操作的是同一个内存地址上存储的值。所以这又需要使用加锁来保证操作的原子性。（共享内存系统：通过）
  - 线程间通讯还可以通过**消息传递**的机制，即将线程间共享状态的各种操作都封装在线程之间传递的消息中。这通常要求发消息时对状态进行复制，并且在消息传递的边界上交出状态的所有权。（消息传递系统：通过消息来共享内存）

#### Go协程的优势

- 协程 最大的优势在于 **轻量级**。
  - 资源占用小，每个Goroutine的初始栈大小仅为2k；
  - 我们可以轻松创建上百万个协程而不会导致系统资源衰竭，而线程和进程通常最多不能超过1万个（C10K问题）。
  - Go语言协程间的切换管理不依赖系统的进程和线程，也不依赖于CPU的核心数量。它是由Go运行时而并不是操作系统调度，goroutine上下文切换在用户层完成。通过协程实现并发编程非常简单。
  - Go语言是通过 —— “消息传递系统：通过消息来共享内存” 来实现的。同时协程和用于传递协程间消息的**channel**一起，共同构筑了Go语言协程系统。所以Go通过协程实现并发非常方便。

#### 利用多核CPU实现并行计算

- runtime.NumCPU()  获取逻辑CPU核心数

- 子协程数与CPU数量保持一致，便可以充分利用多核**并行**运算。

```go
package main

import (
    "fmt"
    "runtime"
    "time"
)

func sum(seq int, ch chan int) {
    defer close(ch)
    sum := 0 
    for i := 0; i <= 1000000; i++ {
        sum += i
    }
    fmt.Printf("子协程%d运算结果：%d\n", seq, sum)
    ch <- sum
}

func main() {
    start := time.Now()
    cpus := runtime.NumCPU()
    runtime.GOMAXPROCS(cpus)
    chs := make([]chan int, cpus)
    for i := 0; i < len(chs); i++ {
        chs[i] = make(chan int, 1)
        go sum(i, chs[i])
    }
    sum := 0
    for _,ch := range chs {
        res := <- ch
        sum += res
    }
    end := time.Now()
    fmt.Printf("最终运算结果: %d, 执行耗时(s): %f\n", sum, end.Sub(start).Seconds())
}
```

## Go协程

### Go协程原理

- Go语言的调度器通过使用与CPU数量相等的线程来减少因线程频繁切换带来的内存开销。同时在每一个线程上执行更加轻量级的协程来降低负载。每个协程非常轻量级，只占几KB，所以可以让有限的内存空间支持大量协程，从而实现高并发。

##### G-M-P模型

- G — Goroutine（协程）；M — Machine（机器，指内核线程）；P — Processor（调度器）。

![图片](/images/feishu/feishu-go-08-3bd4c3/boxcnxMxx8GSWijZvwD1U7jpa4f.png)

- 全局队列：存放待运行的G；

- P的本地队列：存放的也是待运行的G，存放数量上限256个。新建G时，G优先加入到P的本地队列，如果队列满了，则会把本地队列中的一半G移动到全局队列；

- P列表：所有的P都在程序启动时创建，保存在数组中，最多有GOMAXPROCS个，可通过runtime.GOMAXPROCS(N)修改，N表示设置的个数。

**调度流程**：

- 线程M想运行任务，就需要获取P，即跟P关联；

- 然后从P的本地队列获取G；

- 若P的本地队列没有可运行的G，M会尝试从全局队列拿一批G放到P的本地队列；

- 若全局队列也没有可运行的G，M会随机从其他P的本地队列偷一半放到自己P的本地队列中；

- 拿到可运行的G后，M会运行G，G执行完后，M会从P获取下一个G，不断重复下去；

**调度初始化：**

![图片](/images/feishu/feishu-go-08-3bd4c3/boxcnGwTfBoTzTYg7UrM4tjGu4g.png)

- M0：启动程序后，编号为0的主线程，这个M对应的实例会在全局变量runtime.m0中，不需要在heap上分配，M0负责执行初始化操作和启动第一个G，在之后M0就和其他的M一样了。

- G0：每次启动一个M就会创建一个Goroutine，G0仅用于负责调度G，G0不执行任何可执行的函数，每个M都会有一个自己G0。和普通G的栈在堆上分配不同，G0的栈是M对应线程的栈，所有调度相关的代码，会先切到G0栈中再执行。

### Go协程实践

- go关键字就可以开辟一条协程：
  - 这段代码里，有两个协程：一个是go关键字声明的显示协程，一个是main函数所在的主协程。
```go
package main

import "fmt"
import "time"

func add(a, b int) {
    var c = a + b
    fmt.Printf("%d + %d = %d", a, b, c)
}

func main() {
    go add(1, 2) // 开辟一条协程
    
    // 10个子协程，并发执行。（顺序无保证）
    for i := 0; i < 10; i++ {
        go add(1, i)
    }
    time.Sleep(10 * time.Second)
}
```

### Go协程通信

#### 通过共享内存通信

- 共享内存，其实就是就是使用一个能够在多个协程中访问到的变量。比如全局变量或静态变量。

- 但是多个协程共同访问一个变量，肯定会出现问题。所以需要加锁来保证操作的原子性。

```go
package main
import (
    "fmt"
    "time"
    "runtime"
    "sync"
)

var counter int = 0
func addV2(a, b int, lock *sync.Mutex) {
    lock.Lock()
    c := a + b
    counter++
    fmt.Printf("%d: %d + %d = %d", counter, a, b, c)
    lock.Unlock()
}

func main() {
    start := time.Now()
    lock := &sync.Mutex()
    for i := 0; i < 10; i++ {
        go addV2(1, i, lock)
    }
    for {
        lock.Lock()
        c := counter
        lock.Unlock()
        runtime.Gosched()
        if c >= 10 {
            break
        }
    }
    end := time.Now()
    consume := end.Sub(start).Seconds()
    fmt.Println("程序执行耗时（s）:", consume)
}
```

上面例子是通过加锁的方式，串行执行所有协程。还可以通过**sync.WaitGroup**进行控制。

**sync.WaitGroup （****和swift信号量类似****）**

- Add：WaitGroup类型有一个计数器，默认值是0，Add方法用来增加这个计数器的值，通常我们可以通过这个方法来标记需要等待的子协程数量

- Done：当子协程执行完毕后，可以通过Done方法标记已完成。它也会将WaitGruop里的计数器减1

- Wait：阻塞当前协程，知道对应WaitGroup的计数器值为0。如果在该方法调用时，计数器已经是0，则不会做任何事。

```go
package main
import (
    "fmt"
    "sync"
    "time"
)

func addV3(a, b int, doneFunc func()) {
    defer func() {
        doneFunc()
    }()
    c := a + b
    fmt.Printf("%d + %d = %d", a, b, c)
}

func main() {
    start := time.Now()
    wg := sync.WaitGroup()
    // wg.Add(10) // 初始化计数器
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go addV3(1, i, wg.Done)
    }
    wg.Wait() // 等待子协程全部完成
    end := time.Now()
    consume := end.Sub(start).Seconds()
    fmt.Println("程序执行耗时（s）:", consume)
}
```

注意：需要确保Add方法增加的数量和Done方法减少的数量一致。不一致会出问题。

#### 通过消息通信

通道是进程间的通信方式，因此通道传递对象的过程和调用函数时的参数传递行为一致，也可以传递指针。当然了，如果是进程间通信，那还是使用socket或http。

#### Channel

- 一种数据类型，专门用于Go语言协程通信，本身是并发安全的。

- 可以把通道channel看作是一个先进先出的队列，通道中的元素会严格按照发送顺序排列，继而按照排列顺序被接收。

- **Channel初始化**。关键字chan来声明通道类型，后面的类型表示通道传递数据的类型。
  - 通道是引用类型，所以可以使用make进行初始化。
  - 通道操作是原子性的，同时只能进行发送或接收操作。
  - 有容量的通道称为**带缓冲channel**
  - 无容量的通道称为**无缓冲channel**
  - channel是用于Goroutine间通信的，所以绝大多数对channel的**读写都被分别放在了不同的Goroutine中**。

```go
var ch chan int // 声明一个传递整形的通道变量

ch := make(chan int) // 初始化一个只能传递int类型的通道。无缓冲chanenl
ch := make(chan int, 10) // 第2个参数表示通道的容量，默认值是0。带缓冲channel

ch <- 1 // 把元素1发送到通道。接收channel

element := <- ch // 接收通道的值。也可以留空表示忽略 <- ch。发送channel
```

eg：

```go
package mian
import (
    "fmt"
    "time"
)

func add(a, b int, ch chan int) {
    c := a + b
    tmf.Printf("%d + %d = %d", a, b, c)
    ch <- 1
}

func main() {
    start := time.Now()
    chs := make([]chan int, 10)
    for i:= 0; i < 10; i++ {
        chs[i] = make(chan int)
        go add(1, i, chs[i])
    }
    for _, ch := range chs {
        <- ch
    }
    end := time.Now()
    consume := end.Sub(start).Seconds()
    fmt.Println("程序耗时（s）:", consume)
}
```

##### 无缓冲channel

- 由于无缓冲channel不带有缓存区，所以Goroutine对无缓冲channel的**接收和发送是同步**的。

- **无缓冲channel，一定要发送和接收操作同时存在，且两个操作一定要放在两个不同的Goroutine中进行，否则会导致死锁。**
  - 因为是同步的，所以如果只有一个操作，都会陷入挂起等待。而如果两个操作都在一个协程中，则就是循环等待。

```go
func main() {
    ch1 := make(chan int)
    ch1 <- 13 // 这里会一直等待
    n := <- ch1 // 这里会一直等待
    println(n)
}

func  main() {
    ch1 := make(chan int)
    go func() {
        ch1 <- 13
    }()
    n := <- ch1
    println(n)
}
```

###### 用法1：用作信号传递

- 1-1通知信号

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

type signal struct{}

func worker() {
    fmt.Println("worker is working ...")
    time.Sleep(2 * time.Second)
}

func spawn(f func()) <-chan signal {
    c := make(chan signal)
    go func() {
        fmt.Println("worker start to work...")
        f()
        c <- signal{}
    }()
    return c
}

func main() {
    fmt.Println("start a worker...")
    c := spawn(worker)
    <-c // 这里会阻塞，直到等到信号回来
    fmt.Println("worker work done!")
}
```

- 1-n广播通知

```go

import (
    "fmt"
    "sync"
    "time"
)

type signal struct{}

func worker2(i int) {
    fmt.Printf("worker %d: is working...\n", i)
    time.Sleep(2 * time.Second)
    fmt.Printf("worker %d: works done!\n", i)
}

func spawnGroup(f func(i int), num int, groupSignal <- chan signal) <-chan signal {
    c := make(chan signal)
    var wg sync.WaitGroup

    for i := 0; i < num; i++ {
        wg.Add(1)
        go func(i int) {
            <- groupSignal
            fmt.Printf("worker %d: start to worker...\n", i)
            f(i)
            wg.Done()
        }(i + 1)
    }

    go func ()  {
        wg.Wait()
        c <- signal{}
    }()
    return c
}

func signalF2() {
    fmt.Printf("start group of workers...")
    groupSignal := make(chan signal)
    c := spawnGroup(worker2, 5, groupSignal)
    time.Sleep(5 * time.Second)
    fmt.Println("the group of workers start to work...")
    close(groupSignal)
    <- c
    fmt.Println("the group of workers work done!")
}

func main() {
    signalF2()
}
```

###### 用法2：用于替代同步锁

```go

type counter struct {
    c chan int
    i int
}

func NewCounter() *counter {
    cter := &counter{
        c: make(chan int),
    }
    go func() {
        for {
            cter.i++
            cter.c <- cter.i
        }
    }()
    return cter
}

func (cter *counter) Increeace() int {
    return <-cter.c
}

func signalF3() {
    cter := NewCounter()
    var wg sync.WaitGroup
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func(i int) {
            v := cter.Increeace()
            fmt.Printf("goroutine-%d: cuttent counter value is %d\n", i, v)
            wg.Done()
        }(i)
    }
    wg.Wait()
}

func main() {
    signalF3()
}
```

##### 带缓冲Channel

- **缓冲区未满的情况下，对它进行发送操作的Goroutine并不会阻塞挂起；在缓冲区有数据的情况下，对它进行接收操作的Goroutine也不会阻塞挂起**。 

- **当缓冲区满了的情况下，对它进行发送操作的Goroutine会阻塞挂起；当缓冲区为空的情况下，对它进行接收操作的Goroutine也会阻塞挂起。**

```go
func main() {
    ch2 := make(chan int, 1)
    n := <-ch2 // 此时缓冲区为空，对它进行接收操作将导致Goroutine挂起
    
    ch3 := make(chan int, 1)
    ch3 <- 12
    ch3 <- 13 // 此时缓冲区已满，对它进行发送操作，也将导致Goroutine挂起
}
```

##### 单向channel

- 只发送channel和只接收channel

- 这种单向的channel通常只会存在函数的参数类型或者返回值中

```go
func producee(ch chan<- int) {
    for i := 0; i < 10; i++ {
        ch <- i + 1
        time.Sleep(time.Second)
    }
    close(ch)
}

func consume(ch <- chan int) {
    for n := range ch {
        println(n)
    }
}

func mian() {
    ch := make(chan int, 5)
    var wg sync.WaitGroup
    wg.Add(2)
    go func() {
        produce(ch)
        wg.Done()
    }()

    go func() {
        consume(ch)
        wg.Done()
    }()

    wg.Wait()
}
```

- close：关闭通道，通道只能在发射一方关闭。

```go
package main
import (
    "fmt"
    "time"
)

func test(ch chan int) {
    for i := 0; i < 10; i++ {
        ch <- i
    }
    close(ch)
    ch <- 13 //panic 报错
}

func main() {
    start := time.Now()
    ch := make(chan int, 20)
    go test(ch)
    for i := range ch {
        fmt.Println("接收到的数据:", i)
    }
    end := time.Now()
    consume := end.Sub(start).Seconds()
    fmt.Println("程序执行耗时(s):", consume)
}
```

##### Select语句等待通道就绪

- 意思是我们可以先设置好可能产生的结果，等待通道执行。

- case 并不是if else的先后关系，而是会并发执行。然后select会选择先操作成功返回的case分支去执行，如果同时返回，则随机执行一个；如果都没返回，则进入default分支。

```go
select {
    case <- chan1;
        // 如果从chan1通道成功接收数据，则执行改分支
    case chan2 <- 1:
        // 如果成功向chan2通道发送数据，则执行这个分支
    default:
        // 如果上面都没有成功，则执行这个分支。
}
```

- select语句只能对其中的每一个case表达式各求值1次。比如chan1，被求值过1次后，再次命中就不会触发了。如果想连续操作的话，需要借助for循环

```go
package main
import (
    "fmt"
    "math/rand"
)

func main() {
    chs := [3]chan int{
        make(chan int, 3),
        make(chan int, 3),
        make(chan int, 3),
    }
    
    index1 := rand.Intn(3) // 随机生成0-2之间的数字
    fmt.Printf("随机索引/数值：%d\n", index1)
    chs[index1] <- rand.Int() // 向通道发送随机数字
    
    index2 := rand.Intn(3) // 随机生成0-2之间的数字
    fmt.Printf("随机索引/数值：%d\n", index2)
    chs[index2] <- rand.Int() // 向通道发送随机数字
    
    index3 := rand.Intn(3) // 随机生成0-2之间的数字
    fmt.Printf("随机索引/数值：%d\n", index3)
    chs[index3] <- rand.Int() // 向通道发送随机数字
    
    // 哪一个通道中有值，哪一个对应的分支就会被执行
    for i := 0; i < 3; i++ {
        select {
        case num, ok := <- chs[0]:
            if !ok {
                break
            }
            fmt.Println("第一个条件分支被选中：chs[0]=>", num)
        case num, ok := <- chs[1]:
            if !ok {
                break
            }
            fmt.Println("第一个条件分支被选中：chs[1]=>", num)
        case num, ok := <- chs[2]:
            if !ok {
                break
            }
            fmt.Println("第一个条件分支被选中：chs[2]=>", num)
        default:
            fmt.Println("没有分支被选中")
        }
    }
}
```

注意：上面程序中的break只能结束当前的select语句，并不会对for循环产生印象。

##### 通道使用的错误和异常处理

- 在并发编程的通信过程中，最需要处理的就是**超时问题**：比如向通道发送数据时发现通道已满，或者从通道接收数据时发现通道为空。如果不正确处理这些情况，很可能会导致整个协程阻塞并产生死锁。
  - 比如如下代码。select永远等不到ch通道的返回（而且也没有default分支），那么就会产生死锁。如果有defalut分支，则就会继续往下执行。

```go
package main

import (
    "fmt"
)

func main() {
    ch := make(chan int, 1)
    
    select {
    case <- ch:
        fmt.Println("接收到ch通道数据")
    }
    fmt.Println("程序结束")
}

fatal error: all goroutines are asleep - deadlock!

goroutine 1 [chan receive]:
main.main()
        /tmp/sandbox3063364004/prog.go:11 +0x30
```

- 对已关闭的通道发送数据或关闭已关闭的通道。

###### 超时处理机制

- 使用超时协程，来走出等待。

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan int, 1)
    
    timeout := make(chan bool, 1)
    
    go func() {
        time.Sleep(1e9) // 睡眠1s
        timeout <- true
    }()
    
    select {
    case <- ch:
        fmt.Println("接收到ch通道数据")
    case <- timeout:
        fmt.Println("超时1s，程序退出")
    }
}
```

###### 避免对已关闭通道进行操作

- 为了避免对已关闭通道再度执行关闭操作引发panic，一般我们约定**只能在发送方关闭通道**。而在接收方，我们通过通道接收操作返回的第二个参数是否为false判定通道是否已经关闭，如果已经关闭，则不再执行发送操作

```go
package main
import "fmt"

func main() {
    ch := make(chan int, 2)
    // 发送方
    go func() {
        for i := 0; i < 5; i++ {
            fmt.Printf("发送方：发送数据 %v... \n", i)
            ch <- i
        }
        fmt.Println("发送方：关闭通道...")
        close(ch)
    }()
    // 接受方
    for {
        num, ok := <- ch
        if !ok {
            fmt.Println("接收方：通道已关闭")
            break
        }
        fmt.Println("接收方：接收数据：%v\n", num)
    }
    fmt.Println("程序退出")
}
```

#### sync包

前面我们讲到的通道，是**使用通信共享内存**。但是通过**使用共享内存通信**是很多语言的主流并发编程的解决方案。而共享内存必然涉及并发过程中的共享数据冲突问题。所以Go语言也保留了这种处理数据冲突的方案——**锁机制**，Go语言的锁都位于**sync包**中。

##### 互斥锁

```go
package main

import (
    "fmt"
    "runtime"
    "time"
    "sync"
)

var counter int = 0

func add(a, b int, lock * sync.Mutex) {
    c := a + b
    lock.Lock()
    counter++
    fmt.Printf("%d: %d + %d = %d\n", counter, a, b, c)
    lock.Unlock()
}

func main() {
    start := time.Now()
    lock := &sync.Mutex{}
    for i := 0; i < 10; i++ {
        go add(1, i, lock)
    }
    
    for {
        lock.Lock()
        c := counter
        lock.Unlock()
        runtime.Gosched()
        if c >= 10 {
            break
        }
    }
    
    end := time.Now()
    consume := end.Sub(start).Seconds()
    fmt.Println("程序执行耗时(s): ", consume)
}
```

##### 读写锁

读锁占用的时候，会阻止写，但不会阻止读。写锁会阻止其他任何操作

```go
package main

import (
    "fmt"
    "runtime"
    "time"
    "sync"
)

var counter int = 0

func add(a, b int, lock *sync.RWMutex) {
    c := a + b
    lock.Lock()
    counter++
    fmt.Printf("%d: %d + %d = %d\n", counter, a, b, c)
    lock.Unlock()
}

func main() {
    start := time.Now()
    lock := &sync.RWMutex{}
    for i := 0; i < 10; i++ {
        go add(1, i, lock)
    }
    
    for {
        lock.RLock()
        c := counter
        lock.RUnlock()
        runtime.Gosched()
        if c >= 10 {
            break
        }
    }
    end := time.Now()
    consume := end.Sub(start).Seconds()
    fmt.Println("程序执行耗时(s):", consume)
}
```

##### 条件锁

其实是条件变量与互斥锁组合使用。条件发生变化时会发出信号，互斥锁做出对应反应。（和swift的信号量是一样的）

sync.Cond 底层实现

```go
// sync.Cond结构体
type Cond struct {
    noCopy noCopy
    
    L Locker
    
    notify notifyList
    checker copyChecker
}

// 等待通知
func (c *Cond) Wait() {
    c.checker.check()
    t := runtime_notifyListAdd(&c.notify)
    c.L.Unlock()
    runtime_notifyListWait(&c.notify, t)
    c.L.Lock()
}

// 单发通知
func (c *Cond) Signal() {
    c.checker.check()
    runtime_notifyListNotifyOne(&c.notify)
}

// 广播通知
func (c *Cond) Broadcast() {
    c.checker.check()
    runtime_notifyListNotifyAll(&c.notify)
}
```

eg：读取器和写入器：读取器必须依赖写入器对缓冲区进行数据写入后，才可以从缓冲区中读取数据，写入器每次写完后，通过通知机制通知处于阻塞状态的读取器。

```go
package main

import (
    "bytes"
    "fmt"
    "io"
    "sync"
    "time"
)

// 数据
type DataBucket struct {
    buffer *bytes.Buffer // 缓冲区
    mutex *sync.RWMutex // 互斥锁
    cond *sync.Cond // 条件变量
}

func NewDataBucket() *DataBucket {
    buf := make([]byte, 0)
    db := &DataBucket {
        buffer: bytes.NewBuffer(buf),
        mutex: new(sync.RWMutex),
    }
    db.cond = sync.NewCond(db.mutex.RLocker())
    return db
}

// 读取器
func (db *DataBucket) Read(i int) {
    db.mutex.RLock() // 打开读锁
    defer db.mutex.RUnlock() // 结束后释放读锁
    var data []byte
    var d byte
    var err error
    for {
        // 每次读取一个字节
        if d, err = db.buffer.ReadByte(); err != nil {
            if err == io.EOF { // 缓冲区数据为空时执行
                if string(data) != "" { // data不为空，则打印它
                    fmt.Printf("reader-%d: %s\n",i,data)
                }
                db.cond.Wait() // 缓冲区为空，通过wait方法等待通知，进入阻塞状态
                data = data[:0] // 将data清空
                continue
            }
        }
        data = append(data, d) // 将读取的数据添加到data中
    }
}

// 写入器
func (db *DataBucket) Put(d []byte) (int, error) {
    db.mutex.Lock() // 锁定
    defer db.mutex.Unlock() // 开锁
    // 写入数据块
    n, err := db.buffer.Write(d)
   //  db.cond.Signal() // 写入数据后通过signal通知处于阻塞状态的读取器
    db.cond.Broadcast() //
    return n, err
}

func main() {
    db := NewDataBucket()
    for i := 1; i < 3; i++ { // 启动多个读取器
        go db.Read(i)
    }
    for j := 0; j < 10; j++ { // 启动多个写入器
        go func(i int) {
            d := fmt.Sprintf("data-%d", i)
            db.Put([]byte(d)) // 写入数据到缓存区
        }(j)
        time.Sleep(100 * time.Millisecond)
    }
}
```

注意：这里如果不启动多个读取器和写入器，只有单个阻塞线程，则使用Signal()进行通知，如果是多个，则使用Broadcast方法。（但是这里使用signal和broadcast的效果是一样的，不知为何）

##### 原子操作

虽然上述说明互斥锁能够使得协程在执行临界区代码时，不被其他协程打扰，实现串行执行。

但是，它仍可能被中断。所谓中断，就是CPU将代码从运行态切换到非运行态。且它是CPU和操作系统级别的。所以任何语句执行过程中都是可能会出现的（比如任何两条语句执行的间隙）。即使是加了锁的临界区也是如此。

原子操作：就是指代码执行不会被中断。这需要CPU或操作系统提供支持。

sync/atomic提供了部分原子操作的函数，比如加法、比较交换、加载、存储、交换。

```go
// 加减法
func AddInt32(addr *int32, delta int32) (new int32)
var i int32 = 1
atomic.AddInt32($i, 1)

// 比较交换
func CompareAndSwapInt32(addr *int32, old, new int32) (swapped bool)
var a int32 = 1
var b int32 = 2
atomic.CompareAndSwapInt32(&a, a, b)

// 加载
func LoadInt32(addr *int32) (val int32)
var x int32 = 100
y := atomic.LoadInt32(&x)

// 存储
func StoreInt32(addr *int32, val int32)
var x int32 = 100
var y int32
atomic.StoreInt32(&y, atomic.LoadInt32(&x))

// 交换
func SwapInt32(addr *int32, neew int32) (old int32)
var j int32 = 1
var k int32 = 2
j_old := atomic.SwapInt32(&j, k)

//原子类型
var v atomic.Value
v.Store(100)
```

##### sync.WaitGroup

当组里的所有协议都执行完了，再响应最终实现。

- Add：WaitGroup类型有一个计数器，默认值是0，Add可以增加这个计数器的值，可以通过这个方法来标记需要等待的子协程数量；

- Done：当某个子协程执行完毕，可以使用Done方法标记已完成，这样计数器值会进行减一。

- Wait：阻塞当前协程，直到WaitGroup计数器值归零。如果该方法调用时，已经是0，则它不会做任何事。

通过WaitGroup，可以实现一主多子的额协程协作方式。

```go
package main

import (
    "fmt"
    "sync"
)

func add_num(a, b int, deferFunc func()) {
    defer func() {
        deferFunc()
    }()
    c := a + b
    fmt.Printf("%d + %d = %d\n", a, b, c)
}

func main() {
    var wg sync.WaitGroup
    wg.Add(10)
    for i := 0; i < 10; i++ {
        go add_num(i, 1, wg.Done)
    }
    wg.Wait()
}
```

##### sync.Once

确保代码只执行一次。

它只提供了一个Do方法，用于接收一个函数。内部还有一个uint32类型的done字段。用于记录Do传入函数调用的次数。显然，其对应的值只能是0和1.

底层实现代码：

```go
func (o *Once) Do(f func()) {
    if atomic.LoadUint32(&0.done) == 1 {
        return
     }
     o.m.Lock()
     defer o.m.Unlock()
     if o.done == 0 {
         defer atomic.StoreUint32(&o.donee, 1)
         func()
     }
}
```

使用：

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

func dosomething(o *sync.Once) {
    fmt.Println("start:")
    o.Do(func() {
        fmt.Println("Do Someething ...") // 这里永远只会调用1次
    })
    fmt.Println("finished:")
} 

func main() {
    o := &sync.Once{}
    go dosomething(o)
    go dosomething(o)
    time.Sleep(time.Second * 1)
}
```

##### sync.Pool

sync.Pool是一个临时对象池，用来临时存储对象。下次使用时从对象池中获取，避免重复创建对象。可以把Pool看做是一个可复用的容器。

- Put：存储。

- Get：获取。

当我们使用Get方法从Pool对象池中获取对象后，会将原来放在里面的对象删除，最后在返回这个对象。如果临时对象池中原来没有存储任何对象，调用Get方法会通过对象池的额New字段对应创建一个新值并返回。从而保证无论临时对象是否存在值，始终都能返回结果。

```go
package main
import (
    "fmt"
    "sync"
)

func main() {
    var pool = &sync.Pool {
        New: func() interface{} {
            return "Hello world"
        },
    }
    value := "hell, go"
    pool.Put(value)
    fmt.Println(pool.Get())
    fmt.Println(pool.Get())
    fmt.Println(pool.Get())
    fmt.Println(pool.Get())
    fmt.Println(pool.Get())
}
```

sync.Pool是并发安全的。我们可以在程序开始执行时全局唯一初始化Pool对象，然后在并发执行的协程之间通过这个临时对象池来存储和获取对象。

```go
package main

import (
    "fmt"
    "sync"
)

func test_put(pool *sync.Pool, deferFunc func()) {
    defer func() {
        deferFunc()
    }()
    value := "hello, go"
    pool.Put(value)
}

func main() {
    var wg sync.WaitGroup
    wg.Add(1)
    var pool = &sync.Pool {
        New: func() interface{} {
          return  "hello world"
        },
    }
    go test_put(pool, wg.Done)
    wg.Wait()
    fmt.Println(pool.Get())
    fmt.Println(pool.Get())
    fmt.Println(pool.Get())
    fmt.Println(pool.Get())
}
```

#### context包

上面内容中，sync.WaitGroup类型优化通道对多协程协调的处理。但是它在启动协程之前都是已经明确知道子协程的数量。如果不知道的情况下，怎么实现呢？

- 方案一：通过sync.WaitGroup分批启动子协程。
  - 这里需要注意：Add函数和Wait函数最好配对使用。否则会引起panic

```go
package main

import (
    "fmt"
    "sync"
)

func add_num(a, b int, deferFunc func()) {
    defer func() {
        deferFunc()
    }()
    c := a + b
    fmt.Printf("%d + %d = %d\n", a, b, c)
}

func main() {
    total := 10
    step := 2
    fmt.Println("启动子协程...")
    var wg sync.WaitGroup
    for i := 0; i < total; i = i + step {
        wg.Add(step)
        for j := 0; j < step; j++ {
            go add_num(i + j, 1, wg.Done)
        }
        wg.Wait()
    }
    fmt.Println("所有子协程执行完毕")
}
```

- 方案二：context包（面试必考）

（还是不是很理解context包的作用）

```go
package main

import (
    "fmt"
    "context"
    "sync/atomic"
    "time"
)

func AddNum(a *int32, b int, deferFunc func()) {
    defer func() {
        deferFunc()
    }()
    for i := 0; ; i++ {
        curNum := atomic.LoadInt32(a)
        newNum := curNum + 1
        time.Sleep(time.Millisecond * 200)
        if atomic.CompareAndSwapInt32(a, curNum, newNum) {
            fmt.Printf("number 当前值：%d [%d - %d]\n", *a, b, i)
            break
        }
    }
}

func main() {
    total := 10
    var num int32
    fmt.Printf("number 初始值： %d\n", num)
    fmt.Println("启动子协程...")
    ctx, cancelFunc := context.WithCancel(context.Background())
    for i := 0; i < total; i++ {
        go AddNum(&num, i, func() {
            if atomic.LoadInt32(&num) == int32(total) {
                cancelFunc()
            }
        })
    }
    <- ctx.Done()
    fmt.Println("所有子协程执行完毕")
}
```


