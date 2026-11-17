---
title: "内存检测工具调研整理"
date: "2024-05-22"
category: "性能与稳定性"
tags: ["内存管理","性能与稳定性","工程效率"]
description: "背景： 目前我们项目的内存还是有一些问题，尤其是内存警告和OOM数据量太大，所以需要对内存进行持续地检测和优化。 但是内存检测检测相关的工具太多，每个工具的使用也都有一些特点和优劣。这里对调研过的部分工具进行一个简单的整"
feishu_token: "Hm9ldR6QQo9YoMxXm6ncTngPn3f"
---

# 内存检测工具调研整理

### **背景：**

目前我们项目的内存还是有一些问题，尤其是内存警告和OOM数据量太大，所以需要对内存进行持续地检测和优化。

但是内存检测检测相关的工具太多，每个工具的使用也都有一些特点和优劣。这里对调研过的部分工具进行一个简单的整理。

### **Instrument**

instrument是我们开发过程中使用的最多的库。对内存检测方面使用最多的也是instrument的Leaks和Allocations

苹果根据内存管理的一些概念，将开发者最需要关注的内存分为了以下三类：

- **Leaked memory**: Memory unreferenced by your application that cannot be used again or freed (also detectable by using the Leaks instrument).

- **Abandoned memory**: Memory still referenced by your application that has no useful purpose.

- **Cached memory**: Memory still referenced by your application that might be used again for better performance.

![图片](/images/feishu/feishu-note-47ce16/Al73bd3oqogF4mxHEkZcTX3wnXe.png)

##### **Leaks**

其中**Leaked memory**和**Abandoned memory**都属于应该释放而没有释放的内存，都是内存泄露。

**Leaks**工具则只负责检测**Leaked memory。**比如在MRC中，没有调用release，在ARC中，这种已经不常见了。

**劣势：**而我们平时常见的循环引用导致的内存泄露属于**Abandoned memory**。Leaks工具可能检测不出来。所以它本身也是有限制的。

![图片](/images/feishu/feishu-note-47ce16/PMDcb5Tu9oipH2xJJ0nc4IfEn0c.png)

##### **Allocations**

对于**Abandoned memory，**可以用**Allocations**工具检测出来。检测方法就是用Mark Generation的方式。通过对比前后两次Mark的内存快照。来找到未被及时释放的内存对象。

**劣势：**当然它不方便的就是得手动去标记Mark，然后一个个场景重复去操作。

### **Xcode Debug Memory Graph**

xcode的这个工具也很具象化的知道内存对象被哪些持有。也是很方便的一个工具。

### **MetricKit**

MetricKit 是苹果 iOS13 推出的框架，它会在一天结束后，将过去24小时内收集到的性能数据归集到一起，并在下一次app启动时，同行代理回调过来。接入什么的都很方便。

只是苹果已经将这个工具收集到的数据统计好了，我们可以在xcode -> window -> organizer 看到统计后的数据。

只是目前能看到内存相关的也只是峰值和平均值。所以可以当作一个参考。

### **三方库**

##### **MLeaksFinder**

MLeaksFinder是一个轻量级的、无侵入式的内存泄露检测工具，只需要引入库。就可以自动在App运行过程中，检测到内存泄露的对象并弹窗提醒。但是它只检测UIView和UIViewController对象的内存泄露。其他内存需要额外扩展。

由于MLeaksFinder的便捷使用，所以线下使用是非常方便的。

**原理简介：**

为基类 NSObject 添加一个方法 `-willDealloc` 方法，该方法的作用是，先用一个弱指针指向 self，并在一小段时间(3秒)后，通过这个弱指针调用 `-assertNotDealloc`，而 `-assertNotDealloc` 主要作用是直接中断言。

```objc
(BOOL)willDealloc {
  ...
  __weak id weakSelf = self;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      __strong id strongSelf = weakSelf;
      [strongSelf assertNotDealloc];
  });
  return YES;
}
(void)assertNotDealloc {
  ...
  NSLog(@"Possibly Memory Leak.\nIn case that %@ should not be dealloced, override -willDealloc in %@ by returning NO.\nView-ViewController stack: %@", className, className, [self viewStack]);
}
```

**劣势：**

- 一些特殊情况，不会被释放的对象（比如单例），需要重载willDealloc，return no。否则也会弹窗。

- 特殊情况，比如语音房悬浮窗，也会弹窗。

##### **FBRetainCycleDetector**

Facebook开源的用于检查循环引用的库。

**原理简介：**

从传入的目标对象开始查找其强引用的对象列表，在这个强引用对象列表里继续查找强引用对象，默认查找 10 层。最后在整个有向图中应用DFS算法查找环。如果有向图存在环，则说明目标对象存在循环引用。

所以，当你怀疑某个对象有循环引用时，可以直接使用这个库，将对象传入进行查找。

当然，**劣势**就是不方便对整个项目的循环引用进行排查。

##### **matrix（FOOM强烈推荐）**

微信的matrix库，它的**WCMemoryStatPlugin**插件，是一款性能优化到极致的监控工具。能够全面捕获应用OOM时的内存分配以及调用堆栈情况。

**原理简介：**

主要是底层监控对象的malloc_logger函数，它会将OC alloc、CFAllocate、C malloc等分配方式都统计到。然后使用伸展树对对象进程管理。同时使用Hash Table来存储堆栈信息。然后当发生FOOM时，将信息进行上报。

**劣势：**只监控OOM数据。


