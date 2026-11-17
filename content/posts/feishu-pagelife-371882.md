---
title: "PageLife 实践"
date: "2024-05-11"
category: "iOS 与底层"
tags: ["性能与稳定性"]
description: "PageLife实践 PageLife是我自己起的名字，因为主要依托于VC的生命周期，一个VC一般表示一个页面，就命名为PageLife 本文以：「效果 问题 分析问题 解决方案 存在的问题 」的步骤讲解。 之所以将效果"
feishu_token: "MbZbdpN7KopVvFxgJ0XcDQgnnBM"
---

# PageLife 实践

#### PageLife实践

> PageLife是我自己起的名字，因为主要依托于VC的生命周期，一个VC一般表示一个页面，就命名为PageLife

本文以：「效果-> 问题->分析问题->解决方案->存在的问题 」的步骤讲解。

之所以将效果放在最前面，就是让大家能一开始就能知道PageLife的作用，引起大家听下去的兴趣。

### **效果**

PageLife直接增加VC的可扩展性，能够适当拆分胖VC，避免继续在超大VC中继续添加代码。

同时PageLife通过插件的形式独立业务逻辑，对业务进行解耦。

> 当然PageLife并不依赖VC，而是与业务无关的，如果其他地方需要用到，也可以直接使用。

大家可以思考下，这个效果可以用来解决那些问题。

### **问题**

- 我们肯可能看到过超大VC，在维护的时候由于内部逻辑复杂，导致我们很难再往里面去新增逻辑。

- 或者，内部逻辑种类比较多，很多完全无关的逻辑都糅合了在一起，生怕改这个逻辑的时候变更了另一个业务逻辑的功能。

- 很小的VC如果是某个业务逻辑的汇聚点（比如很多用户路径都会经过这里），比如首页，各种跳转、弹框、或者启动处理事务（后台服务，打点等），很容易慢慢变大。

(还有什么问题呢？)

我们平时在开发的时候使用MVX，但是本质上并没有做到很好的抽离相关逻辑到X里面，所以ViewController这个胶水层还是会变得很大，各种状态也喜欢在这里处理（我们现在使用的是ViewModel，如果可以将这些状态处理全都放在ViewModel中）。

如果将上面的问题汇总成一个问题，就是：如何给VC瘦身，并增加代码的可读性以及可维护性？

大家可以想想，你们是怎么处理的？（MVVM就是一个很好的处理方式）

### **分析**

VC胖了就给它减肥，但是不是直接大刀阔斧的开始割肥肉，这样很容易出问题。稍作分析，这里主要是两点：

- VC本身就很大的。

- VC涉及多个业务逻辑的。

第二点间接的导致了第一点，当然也不排除一个业务逻辑很大很复杂。

这里就可以想想了，既然很多业务逻辑，都是依托在VC上，而VC本质就是一个状态管理的胶水层（管理页面的生命周期），那如果我给每个业务分配一个生命周期线，多个业务逻辑对应多个生命周期线，而不是将它们放在同一个生命周期线上。然后将这些生命周期线单独各自实现。这不就解决了逻辑耦合以及VC劣化为超胖VC的问题了么？

### **方案**

      如何将一条生命周期线变成多条生命周期线呢？立马就可以想到“观察者模式”的插件化。

VC只是作为一个分发中心，其他插件只观察者观察VC的生命周期，这样VC的声明周期线就拆分成了各个插件各自的声明周期线了。

代码很简单，大家去看TPPageLife即可， 下面部分代码逻辑：

```swift
extension TPPageLifeManager: TPPageLifeService {
    func pageDidLoad(context: TPPageContext, pluginCoordinator: TPPluginCoordinator?) {
        plugins.forEach { item in
            item.value.pageDidLoad(context: context, pluginCoordinator: self)
        }
    }
    func pageWillShow(context: TPPageContext, pluginCoordinator: TPPluginCoordinator?) {
        plugins.forEach { item in
            item.value.pageWillShow(context: context, pluginCoordinator: self)
        }
    }
    func pageDidShow(context: TPPageContext, pluginCoordinator: TPPluginCoordinator?) {
        plugins.forEach { item in
            item.value.pageDidShow(context: context, pluginCoordinator: self)
        }
    }
    func pageWillHide(context: TPPageContext, pluginCoordinator: TPPluginCoordinator?) {
        plugins.forEach { item in
            item.value.pageWillHide(context: context, pluginCoordinator: self)
        }
    }
    func pageDidHide(context: TPPageContext, pluginCoordinator: TPPluginCoordinator?) {
        plugins.forEach { item in
            item.value.pageDidHide(context: context, pluginCoordinator: self)
        }
    }
    func pageDestoried(context: TPPageContext, pluginCoordinator: TPPluginCoordinator?) {
        plugins.forEach { item in
            item.value.pageDestoried(context: context, pluginCoordinator: self)
        }
    }
}
```

现在来说说这种方式怎么来解决上述几个问题： 

- 对于超大VC，在维护的时候由于内部逻辑复杂，导致我们很难再往里面去新增逻辑。

> 通过添加PageLife, 将新逻辑使用插件的方式插入VC中，这样老逻辑就不用改动，新逻辑的改动只需要在插件总维护即可。同时如果时间允许，可以将负责逻辑抽离到新的插件中。

- 或者，内部逻辑种类比较多，很多完全无关的逻辑都糅合了在一起，生怕改这个逻辑的时候变更了另一个业务逻辑的功能。

- 很小的VC如果是某个业务逻辑的汇聚点（比如很多用户路径都会经过这里），比如首页，各种跳转、弹框、或者启动处理事务（后台服务，打点等），很容易慢慢变大。

> 上面两个问题是一样的，一开始就引入PageLife将，各个逻辑放入单独的插件中，单独维护。

目前我们可以很好的解决VC劣化变大，以及业务耦合的问题，那么使用PageLife的代价是什么呢？。

### **存在的问题**

       有没有发现，PageLife只是简单的将业务逻辑拆分到各个插件中，但是这样如果是两个或者多个业务逻辑之间需要交互怎么办？插件和VC之间要交互怎么办？

       由于我们将VC这张网拆成了星状，VC就是这个星星的中心，而各个星的顶点没有相互依赖而是都依赖星星的中心。

这让我们想到了什么？组件化不就是在讨论这些问题么？只不过我们将组件替换成了一个个更小维度的业务逻辑。

这里的星星顶点就是各个业务逻辑（插件），星星的中心点就是VC。如果插件之间需要通信就需要向VC发送请求，统一由VC来调度。这不就是标准的**中继者模式**了么？

       插件中的消息由action 和 message组成，action表示消息类型，而message表示传递的数据（查看PageLife的`TPPluginAction` 和`TPPluginMessage`） 调度中心就是`TPPluginCoordinator`这样就实现了插件间通信了。而VC和插件之间的数据传递，PageLife使用`TPPageContext`来处里。

### **小结**

        这节主要讲的是使用PageLife来瘦身VC，以及存在的问题。这种方式可以简单的将VC中的逻辑解耦，同时可拔插。但是涉及到数据传递，就会增加代码的复杂性。当然这种方案肯定比直接全都写在VC中复杂，如果是比较简单的VC就无需使用PageLife，但是如果VC很大，就值得使用。

       总之，代码架构是为了解决问题的，适合的才是最好的，在遇到新的问题时再去做优化，让架构去适应变化，始终让代码保持在易维护、易阅读的状态。


