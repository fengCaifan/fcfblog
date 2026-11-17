---
title: "策略模式（⭐️）"
date: "2022-09-24"
category: "工程架构"
tags: ["设计模式","AI Agent","算法与数据结构"]
description: "所谓策略就是对不同类型进行针对性的处理。比如相同的交通工具，每种工具都有各自的使用方法。 策略模式通常用于解耦各个同类型的代码。比如一个枚举，有十几个类型。如果不拆分针对处理，可能会出现一大堆的switch case或者"
feishu_token: "doxcnKHV7TvXSARuOeSxBoDRDVd"
---

# 策略模式（⭐️）

所谓策略就是对不同类型进行针对性的处理。比如相同的交通工具，每种工具都有各自的使用方法。

策略模式通常用于解耦各个同类型的代码。比如一个枚举，有十几个类型。如果不拆分针对处理，可能会出现一大堆的switch-case或者if-else的情况。这使的所有逻辑代码都耦合在一起，而且使用这种代码的地方不止一次。后续每添加一种类型，就会在使用的地方添加一个case或者if-else。这种做法就严重违反了开闭原则。

策略模式的做法就是将不同具体类型单独处理。

### 举个🌰

```swift
 
protocol DomainModel {
    var id: Int { get }
}
 
struct User: DomainModel {
    var id: Int
    var username: String
}
 
protocol DataSource {
    func loadModels<T: DomainModel>() -> [T]
}
 
class MemoryStoragge<Model>: DataSource {
    private lazy var items = [Model]()
    func add(_ items: [Model]) {
        self.items.append(contentsOf: items)
    }
    
    func loadModels<T>() -> [T] where T : DomainModel {
        guard T.self == User.self else { return [] }
        return items as! [T]
    }
}
 
class CoreDataStorage: DataSource {
    func loadModels<T>() -> [T] where T : DomainModel {
        guard T.self == User.self else { return [] }
        let firstUser = User(id: 3, username: "username3")
        let secondUser = User(id: 4, username: "username4")
        
        return [firstUser, secondUser] as! [T]
    }
}
 
class RealmStorage: DataSource {
    func loadModels<T>() -> [T] where T : DomainModel {
        guard T.self == User.self else { return [] }
        let firstUser = User(id: 5, username: "username5")
        let secondUser = User(id: 6, username: "username6")
        
        return [firstUser, secondUser] as! [T]
    }
}
 
class ListController {
    private var dataSource: DataSource?
    
    func update(dataSource: DataSource) {
        self.dataSource = dataSource
    }
    
    func displayModels() {
        guard let dataSource = dataSource else {
            return
        }
        let models = dataSource.loadModels() as [User]
        models.forEach({ debugPrint($0) })
    }
}
 
class Test {
    func test() {
        let controller = ListController()
        let memoryStorage = MemoryStoragge<User>()
        memoryStorage.add(userFromNet())
        clientCode(use: controller, with: memoryStorage)
        clientCode(use: controller, with: CoreDataStorage())
        clientCode(use: controller, with: RealmStorage())
    }
    
    func clientCode(use controller: ListController, with dataSource: DataSource) {
        controller.update(dataSource: dataSource)
        controller.displayModels()
    }
    
    private func userFromNet() -> [User] {
        let firstUser = User(id: 1, username: "username1")
        let secondUser = User(id: 2, username: "username2")
        
        return [firstUser, secondUser]
    }
}
 
Test().test()
```

这里就是3种存储方式对应不同的存储逻辑和数据。

### IM消息展示实战：TODO


