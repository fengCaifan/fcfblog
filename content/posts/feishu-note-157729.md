---
title: "责任链模式"
date: "2022-08-28"
category: "工程架构"
tags: ["设计模式"]
description: "责任链模式是指每一个处理类只承担自己的责任，处理完自己的部分就发送给下一个处理对象。因为要发送给下一个处理对象，所以他们也有公共的接口。其次责任链是由一条链组成的。也就是每个处理类作为链中的一个节点来的。 所以，责任链有"
feishu_token: "doxcnslOafDLlgtb8yMKCckAUsh"
---

# 责任链模式

责任链模式是指每一个处理类只承担自己的责任，处理完自己的部分就发送给下一个处理对象。因为要发送给下一个处理对象，所以他们也有公共的接口。其次责任链是由一条链组成的。也就是每个处理类作为链中的一个节点来的。

所以，责任链有以下特点：

- 由一组对象组成，这组对象遵循相同的接口。

- 这组对象形成一条链路，每个对象职责不一。

框架代码：

```swift
protocol Handler: AnyObject {
    @discardableResult
    func setNext(handler: Handler) -> Handler
    
    func handle(request: String) -> String?
    
    var nextHandler: Handler? { get set}
}
 
extension Handler {
    func setNext(handler: Handler) -> Handler {
        self.nextHandler = handler
        
        return handler
    }
    
    func handle(request: String) -> String? {
        return nextHandler?.handle(request: request)
    }
}
 
class MonkeyHandler: Handler {
    var nextHandler: Handler?
    
    func handle(request: String) -> String? {
        if request == "Banana" {
            return "Monkey: I'll eat the" + request + ".\n"
        }
        return nextHandler?.handle(request: request)
    }
}
 
class SquirrelHandler: Handler {
    var nextHandler: Handler?
    
    func handle(request: String) -> String? {
        if request == "Nut" {
            return "Squirrel: I'll eat the" + request + ".\n"
        }
        return nextHandler?.handle(request: request)
    }
}
 
class DogHandler: Handler {
    var nextHandler: Handler?
    
    func handle(request: String) -> String? {
        if request == "MeatBall" {
            return "Dog: I'll eat the" + request + ".\n"
        }
        return nextHandler?.handle(request: request)
    }
}
 
class Client {
    func test() {
        let monkey = MonkeyHandler()
        let squirrel = SquirrelHandler()
        let dog = DogHandler()
        
        monkey.setNext(handler: squirrel).setNext(handler: dog)
        
        print("Chain: Monkey > Squirrel > Dog\n\n")
        someClientCode(handler: monkey)
        print()
        print("Subchain: Squirrel > Dog\n\n")
        someClientCode(handler: squirrel)
    }
    
    func someClientCode(handler: Handler) {
        let foods = ["Nut", "Banana", "coffee"]
        
        for food in foods {
            print("Client: Who wants a " + food + "?\n")
            guard let result = handler.handle(request: food) else {
                print("  " + food + " was left untouched.\n")
                return
            }
            print("  " + result)
        }
    }
}
 
Client().test()
```

### 总结：

- 责任链模式最突出的特点是满足职责单一原则。同时也是开闭原则的最佳实践，如果要加入新的处理节点，非常好处理。

- iOS中，事件响应链也是一个责任链模式的最佳实践案例。

- 应用场景：
  - 当程序需要使用不同方式处理不同种类请求时，而且请求的类型和顺序预先未知时，可以使用责任链模式。
  - 当必须按顺序执行多个处理者时，可以使用该模式
  - 如果所需处理者及其顺序必须在运行时进行改变，可以使用责任链模式。

[责任链模式：信息校验](https://www.jianshu.com/p/a73677601c7b)


