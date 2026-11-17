---
title: "SwiftUI控件02 —— Text 文字"
date: "2023-10-31"
category: "iOS 与底层"
tags: ["SwiftUI","Swift","渲染与UI"]
description: "Text类似UIKit的UILabel 简单文字 变更字体与颜色 多行文字 边距与行间距 文字旋转 和 阴影 自定义字体 可以去下载一些字体：https://fonts.google.com/specimen/Agbal"
feishu_token: "NRavdJCJMoeYLRx4vw9cFSsrnac"
---

# SwiftUI控件02 —— Text 文字

Text类似UIKit的UILabel

- **简单文字**

```swift
Text("Stay Hungry, Stay Foolish")
```

- **变更字体与颜色**

```swift
// 
Text("Stay Hungry, Stay Foolish")
            .fontWeight(.bold) // 字体粗细
            .font(.title) // title样式字体，会跟随系统动态变更
            //.font(.system(.largeTitle, design: .rounded)) // 圆滑字体
            // .font(.system(size: 20)) // 固定字号，就不会像title一样跟随系统变更
            .foregroundColor(.green) // 字体颜色
```

- **多行文字**

```swift
Text("Your time is limited, so don’t waste it living someone else’s life. Don’t be trapped by dogma—which is living with the results of other people’s thinking. Don’t let the noise of others’ opinions drown out your own inner voice. And most important, have the courage to follow your heart and intuition.")
            .fontWeight(.medium)
            .font(.system(size: 16, design: .rounded))
            .foregroundColor(.gray)
            .multilineTextAlignment(.center) // 文本剧种对齐
            .lineLimit(3) // 限制3行
            .truncationMode(.head) // 多出的内容截断方式
```

- **边距与行间距**

```swift
Text("Your time is limited, so don’t waste it living someone else’s life. Don’t be trapped by dogma—which is living with the results of other people’s thinking.")
            .fontWeight(.medium)
            .font(.title3)
            .multilineTextAlignment(.leading)
            .lineSpacing(10.0) // 行间距
            .padding() // 边距
```

- **文字旋转 和 阴影**

```swift
Text("Your time is limited, so don’t waste it living someone else’s life. Don’t be trapped by dogma—which is living with the results of other people’s thinking.")
            .fontWeight(.medium)
            .font(.title3)
            .foregroundColor(.gray)
            .multilineTextAlignment(.center)
            .lineSpacing(5)
            .padding()
//            .rotationEffect(.degrees(45)) // 旋转，传入的是角度degrees，以文本视图中心来旋转
//            .rotationEffect(.degrees(20), anchor: UnitPoint(x: 0, y: 0)) // 以左上角为中心旋转
            .rotation3DEffect(
                .degrees(60), axis: (x: 1.0, y: 0.0, z: 0.0)
            ) // 3D 旋转，
            .shadow(color: .red, radius: 2, x: 0, y: 10) // 文字阴影
```

- **自定义字体**

可以去下载一些字体：https://fonts.google.com/specimen/Agbalumo，拖进项目中

然后，在项目targets的info中添加一项Fonts provided by application，将item0的value设置成下载的字体

![图片](/images/feishu/feishu-swiftui-02-text-7f27e1/FfXdbvaxDoSPZWxOvwWc7pJRnDh.png)

```swift

Text("Your time is limited, so don’t waste it living someone else’s life. ")
            .font(.custom("Agbalumo", size: 25))
```

- **Markdown文本样式**

SwiftUI 内置了MarkDown的支持，所以如果文本内容中有markdown格式，则可以自动识别

```swift
Text("**This is how you bold a text**. *This is how you make text italic.* You can [click this link](https://www.appcoda.com) to go to appcoda.com")
    .font(.title)
```


