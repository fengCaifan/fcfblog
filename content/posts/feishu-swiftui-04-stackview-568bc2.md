---
title: "SwiftUI控件04 —— StackView"
date: "2023-11-03"
category: "iOS 与底层"
tags: ["SwiftUI","Swift","渲染与UI"]
description: "基础VStack、HStack、ZStack VStack和HStack都可以定制对齐方式alignment和子视图之间的spacing。 VStack：垂直 HStack：水平 ZStack：上下重叠 这里使用ZSta"
feishu_token: "SdyFdb6JroDAqoxRN52cgVvwngd"
---

# SwiftUI控件04 —— StackView

- **基础VStack、HStack、ZStack**
  VStack和HStack都可以定制对齐方式alignment和子视图之间的spacing。

  - VStack：垂直
```swift
VStack(spacing: 20) {
    Text("Instant Developer")
        .font(.system(size: 40))
        .fontWeight(.medium)
        .foregroundColor(.indigo)
            
    Text("Get help from exports in 15 minutes")
}
```

  - HStack：水平
```swift
HStack(alignment: .bottom, spacing: 10) {
    Image("user1")
        .resizable()
        .scaledToFit()
    Image("user2")
        .resizable()
        .aspectRatio(contentMode: .fit)
    Image("user3")
        .resizable()
        .scaledToFit()
}
.padding(.horizontal, 20) // 左右留空隙
```

  - ZStack：上下重叠
  这里使用ZStack，给按钮绘制了一个圆角为1，width为4的黑色边框，然后绘制了一个圆角为30

```swift
Button{}.background( 
ZStack {
    RoundedRectangle(cornerRadius: 1)
        .stroke(Color.black, style: StrokeStyle(lineWidth: 4))
    RoundedRectangle(cornerRadius: 30)
        .fill(
            LinearGradient(gradient: Gradient(colors: [.red, .yellow]),
                                startPoint: .leading,
                                endPoint: .trailing)
        )
})
```

- 使用**Spacer()** 调整布局

```swift
VStack {
    VStack {
            Text("Instant Developer")
                .font(.system(size: 40))
                .fontWeight(.medium)
                .foregroundColor(.indigo)
            Text("Get help from exports in 15 minutes")
        }
        Spacer() // 加入留白视图，它会展开占用垂直堆叠视图中的所有可用空间。从而将上面的VStack顶到顶部
    }
    .padding(.top, 30) // 因为Spacer()会将内容顶到贴着灵动岛的位置，所以可以使用padding增加适当间距。
}
```

- 图片填充

```swift
VStack {
            VStack {
                Text("Instant Developer")
                    .font(.system(size: 40))
                    .fontWeight(.medium)
                    .foregroundColor(.indigo)
                
                Text("Get help from exports in 15 minutes")
            }
//            Image("user1") // 默认使用原生大小展示图片
            Image("user1")
                .resizable() // 会让图片拉伸到填满可用区域
                .scaledToFit() // 按可用区域，进行fit（保持宽高比）
//                .scaledToFill() // 按可用区域，进行fill（拉伸填满）
//                .aspectRatio(contentMode: .fill)
//                .aspectRatio(contentMode: .fit)
            Spacer() // 加入留白视图，它会展开占用垂直堆叠视图中的所有可用空间。从而将上面的VStack顶到顶部
        }
        .padding(.top, 30) // 因为Spacer()会将内容顶到贴着灵动岛的位置，所以可以使用padding增加适当间距。
    }
```


