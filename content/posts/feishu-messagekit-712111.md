---
title: "MessageKit学习笔记"
date: "2023-06-13"
category: "iOS 与底层"
tags: ["渲染与UI","网络与安全","工程效率"]
description: "MessageKit https://github.com/MessageKit/MessageKit MessageKit是一个处理IM消息展示的一个框架。 图片 /images/feishu/feishu messa"
feishu_token: "YMdcd5BUNoMmkexpGaVcsPg6nTb"
---

# MessageKit学习笔记

[MessageKit](https://github.com/MessageKit/MessageKit)

MessageKit是一个处理IM消息展示的一个框架。

![图片](/images/feishu/feishu-messagekit-712111/boxcnlE41ShRmB4Wmxls7yh5XJf.png)

## 项目结构

### LaunchViewController

- 相当于是整个ChatExample的RootVC。各个example的入口

### Example

#### BasicExampleViewController

- 继承自**ChatViewController**

- 实现了**MessagesCollectionView**的**messagesLayoutDelegate**和**messagesDisplayDelegate**

#### **ChatViewController**

- 几乎所有example都继承自ChatViewController

- 继承自**MessagesViewController**

- 实现了** MessagesCollectionView**的**messagesDataSource**和**messageCellDelegate**

- 实现了键盘**InputBarAccessoryView **的delegate

### MessageKit

#### VC：

#### View：

#### MessagesCollectionViewFlowLayout

- 自定义Layout。重写了获取Attribute的方法；
  - **MessagesCollectionViewLayoutAttributes**：

- Cell Size的计算都是在这里。（goto：布局计算）
  - **适配流程**： FlowLayout通过重写layoutAttributesForItem方法，调用具体的类型的CellSizeCalculator子类获取到自定义或者默认的Calculator，然后再将每个子控件的layout属性，赋值给自定义的LayoutAttribute。当Cell被触发需要更新Layout的时候，就会来获取LayoutAttribute，然后进行适配。

#### **MessagesCollectionViewLayoutAttributes**

- 自定义UICollectionViewLayoutAttributes。

- 自定义了所有子视图的size和位置相关属性。

- LayoutAttribute是每一个item布局所需数据，自定义的LayoutAttribute，不止布局数据，也可以包含其他数据。

- 自定义的LayoutAttribute需要重写copy函数和isEqual函数。（**知识点**）
  - copy函数：
    - 为什么要重写copy函数？因为布局时，是会发生对象拷贝的，比如拷贝到缓存池。所以需要重写copy方法。（**知识点**）
```swift
open override func copy(with zone: NSZone? = nil) -> Any {
    // swiftlint:disable force_cast
    let copy = super.copy(with: zone) as! MessagesCollectionViewLayoutAttributes
    copy.avatarSize = avatarSize
    ...
    return copy
}
```

  - isEqual函数：
    - 为什么要重写这个函数？因为cell的apply函数被调用是系统判断布局是否改变时触发的，如果自定义LayoutAttribute有很多自定义属性，则系统不知道怎么进行判断。所以需要重写这个方法，来告诉它布局对象是否改变了。（**知识点**）
```swift
open override func isEqual(_ object: Any?) -> Bool {
    // MARK: - LEAVE this as is
    if let attributes = object as? MessagesCollectionViewLayoutAttributes {
      return super.isEqual(object) && attributes.avatarSize == avatarSize
        && ...
        && attributes.linkPreviewFonts == linkPreviewFonts
    } else {
      return false
    }
  }
```

**总结：**通常我们自定义FlowLayout的时候，是直接在FlowLayout内计算每个item的LayoutAttribute，然后直接返回。如果对于比较复杂，或者兼容性比较好的父类视图布局，可以考虑自定义LayoutAttribute。（**值得学习借鉴**）

### 自定义协议

#### MessagesDataSource

- 封装了一些MessageCollectionView所需要的数据。

- 继承自MessageViewController的VC，需要实现这个协议。

- SDK外部的Message VC，无需对CollectionView的UICollectionViewDataSource进行实现或者继承MessageViewController的实现方法。只需要实现部分MessageDataSource接口。（感觉是一个**桥接模式**）（**值得学习借鉴**）

- 同时，这样也让MessageViewController这个基类（整个框架Message VC的基类）不依赖于具体的数据，而只依赖于MessageDataSource这个数据协议。（**依赖倒置原则**）（**值得学习借鉴**）

- 

#### MessagesDisplayDelegate

- 封装了每个Cell的一些display接口。比如文本色、背景色等；

#### MessagesLayoutDelegate

- 封装了每个Cell的一些适配相关的接口，比如label的高度等；

## 细节点

### **布局计算**：

#### CellSizeCalculator

- 封装的一个对象，通过IndexPath调整Size和配置Attribute；（一个虚基类，这里应该可以搞成协议）
```swift
public weak var layout: UICollectionViewFlowLayout?

func configure(attributes _: UICollectionViewLayoutAttributes) { }

func sizeForItem(at _: IndexPath) -> CGSize { .zero }
```

#### MessageSizeCalculator

- 继承CellSizeCalculator，实现了具体的调整Size和配置Attribute函数

- 实现了很多子视图的size和layout的默认数值；

- 实现了很多子视图的size和layout计算；
  - Avatar
```swift
// avatar 位置，根据dataSource传进来的Sender数据确定发送还是接受，然后进行约束
open func avatarPosition(for message: MessageType) -> AvatarPosition
// avatar大小，可以通过layoutDelegate获取，也可以使用默认的大小
open func avatarSize(for message: MessageType, at indexPath: IndexPath) -> CGSize
```

  - Top cell Label
```swift
// 通过layoutDelegate自定义size
open func cellTopLabelSize(for message: MessageType, at indexPath: IndexPath) -> CGSize
// 根据dataSource传进来的Sender数据确定发送还是接受，确定位置
open func cellTopLabelAlignment(for message: MessageType) -> LabelAlignment
```

  - Top message Label
```swift
// 通过layoutDelegate自定义size
open func messageTopLabelSize(for message: MessageType, at indexPath: IndexPath) -> CGSize
// 可以通过layoutDelegate自定义位置，也可以直接通过dataSource的Sender数据确定发送还是接受
open func messageTopLabelAlignment(for message: MessageType, at indexPath: IndexPath) -> LabelAlignment
```

  - Message time label
```swift
// 通过dataSource生成Attribute，然后直接获取Attribute的size
open func messageTimeLabelSize(for message: MessageType, at indexPath: IndexPath) -> CGSize
```

  - 其他的子视图大概率也是这种方式进行计算。**size和位置分开来计算或设置**。（**值得学习借鉴**）

- 其次Kit里，根据不同的消息类型，有实现一些默认的布局计算类。都是继承自MessageSizeCalculator。这样一些固定的东西就可以不用额外计算，节省非常多的资源。
  - TextMessageSizeCalculator
  - MediaMessageSizeCalculator
  - LocationMessageSizeCalculator
  - AudioMessageSizeCalculator
  - LinkPreviewMessageSizeCalculator

### 数据Model的实现方式

#### MessageType

- 消息的标准协议，使用此协议创建自己的消息对象;

```swift
public protocol MessageType {
  /// The sender of the message.
  var sender: SenderType { get }

  /// The unique identifier for the message.
  var messageId: String { get }

  /// The date the message was sent.
  var sentDate: Date { get }

  /// The kind of message and its underlying kind.
  var kind: MessageKind { get }
}
```

##### MessageKind

- 一个枚举，表示消息的基础类型，同时带有具体类型的协议。（**值得学习借鉴**）

```swift
public enum MessageKind {
  case text(String)
  case attributedText(NSAttributedString)
  case photo(MediaItem)
  case video(MediaItem)
  case location(LocationItem)
  case emoji(String)
  case audio(AudioItem)
  case contact(ContactItem)
  case linkPreview(LinkItem)
  case custom(Any?)
}

// eg：
public protocol AudioItem {
  var url: URL { get }
  var duration: Float { get }
  var size: CGSize { get }
}
```

### 富文本的计算

- **MessageLabel**
  - 包括各种类型的富文本。比如url、hashtag、phoneNum等。
  - 持有各种NSAttributedString.Key
  - DetectorType： 对正则表达式的探测，使用 NSTextCheckingResult。
  - 富文本的排版和处理，使用了**NSLayoutManager**+**NSTextContainer**+**NSTextStorage**: （**知识点**）
    - **NSLayoutManager**：该类负责对文字进行编辑排版处理，将存储在NSTextStorage中的数据转换为可以在视图控件中显示的文本内容，并把字符编码映射到对应的字形上，然后将字形排版到NSTextContainer定义的区域中；
    - **NSTextContainer**：定义了文本可以排版的区域
    - **NSTextStorage**：主要用来存储文本的字符和相关属性，是NSMutableAttributedString的子类。此外，当NSTextStorage中的字符或属性发生改变时，会通知NSLayoutManager，进而做到文本内容的显示更新；

## 总结：

### 值得学习的点

- 自定义FlowLayout和LayoutAttribute的使用

- 消息类型和具体model的设计

- SDK框架的设计
  - 接口的隔离、拆分；
  - 协议的使用，SDK内部使用协议，外部使用则只实现具体的协议接口。这样隔离了SDK与外部的联系，内部无需关心，外部到底使用的是什么样式的消息和数据。

- 富文本的布局排版**NSLayoutManager**的使用**；**


