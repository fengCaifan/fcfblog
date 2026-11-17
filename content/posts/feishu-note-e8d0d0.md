---
title: "中介者模式（⭐️）"
date: "2022-09-04"
category: "工程架构"
tags: ["Swift","设计模式"]
description: "中介者模式，就是在两个直接交互的结构中间加入一个中介，限制两个对象直接的直接交互，而是通过中介者进行合作。中介者模式可以减少对象间混乱无序的依赖关系，是开发过程中解耦最重要的设计模式之一。 图片 /images/feis"
feishu_token: "doxcnje8AojulzcvOxP9OkRZFAb"
---

# 中介者模式（⭐️）

中介者模式，就是在两个直接交互的结构中间加入一个中介，限制两个对象直接的直接交互，而是通过中介者进行合作。中介者模式可以减少对象间混乱无序的依赖关系，是开发过程中解耦最重要的设计模式之一。

![图片](/images/feishu/feishu-note-e8d0d0/boxcnD8DHRqBRtqQwJ1CyMuc0bh.png)

![图片](/images/feishu/feishu-note-e8d0d0/boxcnI5I4o2X1CJWNjmFOG0Myzd.png)

现实中最直接的例子，就是在航空中，飞机之间不会直接进行交流，而是通过塔台中转。

**在swift中，MCV架构中，Controller其实也扮演了中介者的角色。**

#### 举个🌰

1、点赞中介者：经常会碰到一个实际场景：在Feed列表页有一列数据，可以点击每个item数据，进入到详情，也可以点击详情的按钮进去到评论卡片。现在有个小场景：Feed列表、详情页面、评论卡片都有一个点赞按钮。点击这3个页面的任一一个按钮，都得使3个页面的数据同步。这个时候，就可以使用中介者模式了，具体代码实现：

```swift

 
/// 定义一个New
struct News: Equatable {
    let id: Int
    let title: String
    var likeCount: Int
    
    static func ==(lhs: News, rhs: News) -> Bool {
        return lhs.id == rhs.id
    }
}
 
/// 中介者
protocol LikeUpdatable: AnyObject {
    /// 每个场景都有唯一的id
    var identifier: String { get }
    
    /// 每个场景都监听其他场景发出的点赞消息
    func likeAdded(to news: News)
    
    /// 接收其他场景发出的取消点赞消息
    func likeRemoved(from news: News)
}
 
extension LikeUpdatable {
    var identifier: String {
        return "\(type(of: Self.self))"
    }
}
 
/// 点赞中介者
class LikeMeditor: LikeUpdatable {
    private var scenes: [LikeUpdatable] = []
    
    /// 注册场景
    func registerScenes(scene: LikeUpdatable) {
        scenes.append(scene)
    }
    
    /// 移除场景
    func removeScenes(scene: LikeUpdatable) {
        for (index, item) in scenes.enumerated() where scene.identifier == item.identifier {
            scenes.remove(at: index)
            return
        }
    }
    
    /// 某一个场景触发点赞会调用这个方法，然后这个方法给每个场景发送点赞消息
    func likeAdded(to news: News) {
        scenes.forEach({ $0.likeAdded(to: news) })
    }
    
    /// 某一个场景触发取消点赞会调用这个方法，然后这个方法给每个场景发送取消点赞消息
    func likeRemoved(from news: News) {
        scenes.forEach({ $0.likeRemoved(from: news) })
    }
}
 
/// 使用场景
class NewsFeedVC: LikeUpdatable {
    private var newsArr: [News] = []
    private weak var meditor: LikeMeditor?
    
    init(_ meditor: LikeMeditor?, _ newsArr: [News]) {
        self.meditor = meditor
        self.newsArr = newsArr
    }
    
    /// 接收到点赞，更新数据
    func likeAdded(to news: News) {
        for (index, item) in newsArr.enumerated() where item == news {
            var newNews = item
            newNews.likeCount += 1
            self.newsArr[index] = newNews
            debugPrint("NewsFeed receive a liked news with id: \(newNews.id) count: \(newNews.likeCount)")
        }
    }
    
    /// 接收到取消点赞，更新消息
    func likeRemoved(from news: News) {
        for (index, item) in newsArr.enumerated() where item == news {
            var newNews = item
            newNews.likeCount -= 1
            self.newsArr[index] = newNews
            debugPrint("NewsFeed receive a unliked news with id: \(newNews.id) count: \(newNews.likeCount) ")
        }
    }
    
    /// 当前场景触发点赞（对每个news都进行点赞，实际场景应该只有一个news）
    func liketnClicked() {
        debugPrint("NewsFeed liketnClicked")
        newsArr.forEach({ meditor?.likeAdded(to: $0) })
    }
    
    /// 当前场景触发取消点赞（对每个news都进行取消点赞，实际场景应该只有一个news）
    func unlikeClicked() {
        debugPrint("NewsFeed unlikeClicked")
        newsArr.forEach({ meditor?.likeRemoved(from: $0) })
    }
}
 
class NewsDetailVC: LikeUpdatable {
    private var news: News
    private weak var meditor: LikeMeditor?
    
    init(_ meditor: LikeMeditor?, _ news: News) {
        self.meditor = meditor
        self.news = news
    }
    
    func likeAdded(to news: News) {
        guard news == self.news else {
            return
        }
        self.news.likeCount += 1
        debugPrint("NewsDetail receive a liked news with id: \(self.news.id) count: \(self.news.likeCount) ")
    }
    
    func likeRemoved(from news: News) {
        guard news == self.news else {
            return
        }
        self.news.likeCount -= 1
        debugPrint("NewsDetail receive a unliked news with id: \(self.news.id) count: \(self.news.likeCount) ")
    }
    
    func liketnClicked() {
        debugPrint("NewsDetail liketnClicked")
        meditor?.likeAdded(to: self.news)
    }
    
    func unlikeClicked() {
        debugPrint("NewsDetail unlikeClicked")
        meditor?.likeRemoved(from: self.news)
    }
}
 
class CommandVC: LikeUpdatable {
    private var numOfGivenLikes: Int
    
    init(_  numOfGivenLikes: Int) {
        self.numOfGivenLikes = numOfGivenLikes
    }
    
    func likeAdded(to news: News) {
        numOfGivenLikes += 1
        debugPrint("CommandVC receive a liked news with numOfGivenLikes:\(numOfGivenLikes) ")
    }
    
    func likeRemoved(from news: News) {
        self.numOfGivenLikes -= 1
        debugPrint("CommandVC receive a unliked news with numOfGivenLikes:\(numOfGivenLikes)")
    }
}
 
/// 使用
class Test {
    func test() {
        let newsArr = [News(id: 1, title: "News1", likeCount: 1),
                       News(id: 2, title: "News2", likeCount: 2)]
        let numOfGivenLikes = newsArr.reduce(0, { $0 + $1.likeCount })
        let mediator = LikeMeditor()
        let feedVC = NewsFeedVC(mediator, newsArr)
        let newDetail = NewsDetailVC(mediator, newsArr.first!)
        let commandVC = CommandVC(numOfGivenLikes)
        
        mediator.registerScenes(scene: feedVC)
        mediator.registerScenes(scene: newDetail)
        mediator.registerScenes(scene: commandVC)
        
        feedVC.liketnClicked()
        newDetail.unlikeClicked()
    }
}
 
Test().test()
```

2、**组件化模块化方案——mediator**

[Mediator组件化方案](https://wereadteam.github.io/2016/03/19/iOS-Component/)

[iOS组件化方案](https://zuikyo.github.io/2019/07/15/iOS_inrerface_orientation_modularization/)


