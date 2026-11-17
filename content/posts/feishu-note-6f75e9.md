---
title: "模板方法模式"
date: "2022-09-24"
category: "工程架构"
tags: ["设计模式","算法与数据结构"]
description: "它在超类中定义一个算法框架，允许子类在不改变框架的情况下，重写具体的算法流程。 所以我们经常会发现，一个框架流程，可能有几个步骤是完全一样的，而另外的步骤需要根据子类的具体类型进行区分。这个时候，就可以使用模板方法模式，"
feishu_token: "doxcnoo56jloQzs9VDDMBAXmOlb"
---

# 模板方法模式

它在超类中定义一个算法框架，允许子类在不改变框架的情况下，重写具体的算法流程。

所以我们经常会发现，一个框架流程，可能有几个步骤是完全一样的，而另外的步骤需要根据子类的具体类型进行区分。这个时候，就可以使用模板方法模式，将重复的代码放在父类，将差异化的代码子类重写。

因此，模板方法也建议将步骤细化，这样能够共用的功能就会比较多。

### 举个🌰

```swift
var greeting = "Hello, 模板方法模式"
 
protocol Garden {
    func prepareSoil()
    func plantSends()
    func waterPlants()
    func prepareGarden()
}
 
extension Garden {
    func prepareGarden() {
        prepareSoil()
        plantSends()
        waterPlants()
    }
}
 
final class RoseGarden: Garden {
    func prepare() {
        prepareGarden()
    }
    
    func prepareSoil() {
        debugPrint("prepare soil for rose garden")
    }
    
    func plantSends() {
        debugPrint("plant sends for rose garden")
    }
    
    func waterPlants() {
        debugPrint("water the rose gardan")
    }
}
 
RoseGarden().prepare()
```


