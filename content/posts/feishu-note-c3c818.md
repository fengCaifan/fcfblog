---
title: "命令模式（❓）"
date: "2022-09-03"
category: "工程架构"
tags: ["设计模式"]
description: "不是很理解这个设计模式 命令对象将行动和参数封装起来形成一个类 ，因为类是可以被存储的，所以这个类代表的操作就具有复制粘贴的功能，从而可以做到被重复使用、取消、重做。 简单🌰 这里把开门关门两个动作封装起来了。使得动作"
feishu_token: "doxcnBQRnqEb2C7JHSQppVbQied"
---

# 命令模式（❓）

不是很理解这个设计模式

**命令对象将行动和参数封装起来形成一个类**，因为类是可以被存储的，所以这个类代表的操作就具有复制粘贴的功能，从而可以做到被重复使用、取消、重做。

#### 简单🌰

这里把开门关门两个动作封装起来了。使得动作相互独立，没有关联。动作也可以被重复使用。

```swift
protocol DoorCommand {
    func execute() -> String
}
 
final class OpenCommand: DoorCommand {
    let doors:String
 
    required init(doors: String) {
        self.doors = doors
    }
    
    func execute() -> String {
        return "Opened \(doors)"
    }
}
 
final class CloseCommand: DoorCommand {
    let doors:String
 
    required init(doors: String) {
        self.doors = doors
    }
    
    func execute() -> String {
        return "Closed \(doors)"
    }
}
 
final class HALDoorsOperations {
    let openCommand: DoorCommand
    let closeCommand: DoorCommand
    
    init(doors: String) {
        self.openCommand = OpenCommand(doors:doors)
        self.closeCommand = CloseCommand(doors:doors)
    }
    
    func close() -> String {
        return closeCommand.execute()
    }
    
    func open() -> String {
        return openCommand.execute()
    }
}
 
let podBayDoors = "Pod Bay Doors"
let doorModule = HALDoorsOperations(doors:podBayDoors)
 
doorModule.open()
doorModule.close()
```

#### 复杂🌰

这个例子里多了一个接收者。封装起来的命令会和接收者绑定。使得命令对象起到隔离事件触发和接收者的作用。

```swift
//---------------------------------------------
protocol Command {
    func execute()
}
 
// 一个简单的命令
class SimpleCommand: Command {
    private var payload: String
    
    init(_ payload: String) {
        self.payload = payload
    }
    
    func execute() {
        debugPrint("SimpleCommand: See, I can do simple things like printing (" + payload + ")")
    }
}
 
// 复杂命令》包含一个接收者。当操作ComplexCommand命令后，就可以操作接收者里的方法
class ComplexCommand: Command {
    private var receiver: Receiver
    private var a: String
    private var b: String
    
    init(_ receiver: Receiver, _ a: String, _ b: String) {
        self.receiver = receiver
        self.a = a
        self.b = b
    }
    
    func execute() {
        debugPrint("ComplexCommand: Complex stuff should be done by a receiver object.\n")
        receiver.doSomething(a)
        receiver.doSomethingElse(b)
    }
}
 
// 消息接收者
class Receiver {
    func doSomething(_ a: String) {
        debugPrint("Receiver: Working on (" + a + ")\n")
    }
    
    func doSomethingElse(_ b: String) {
        debugPrint("Receiver: alse Working on (" + b + ")\n")
    }
}
 
/// 调用者
class Invoker {
    private var onStart: Command?
    private var onFinish: Command?
    
    func setOnStart(_ command: Command) {
        onStart = command
    }
    
    func setOnFinish(_ command: Command) {
        onFinish = command
    }
    
    func doSomethingImport() {
        print("Invoker: Does anybody want something done before I begin?")
        
        onStart?.execute()
        
        print("Invoker: ...doing something really important...")
        print("Invoker: Does anybody want something done after I finish?")
        
        onFinish?.execute()
    }
}
 
let invoker = Invoker()
invoker.setOnStart(SimpleCommand("Say Hi!"))
 
let receiver = Receiver()
invoker.setOnFinish(ComplexCommand(receiver, "Send email", "Save report"))
invoker.doSomethingImport()
```


