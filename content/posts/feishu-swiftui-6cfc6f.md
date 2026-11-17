---
title: "SwiftUI 学习杂记"
date: "2023-11-07"
category: "iOS 与底层"
tags: ["SwiftUI","Swift","网络与安全","Flutter"]
description: "https://github.com/appke/PlaySwiftUI 项目 一个swiftUI项目生成后，会有以下两个文件 xxxApp.swift ContentVIew.swift ContentView是实际使"
feishu_token: "MAuadIHrTofXSsxc9L4cQSpOnqp"
---

# SwiftUI 学习杂记

https://github.com/appke/PlaySwiftUI

#### 项目

- 一个swiftUI项目生成后，会有以下两个文件

- xxxApp.swift

```swift
import SwiftUI

@main
struct SwiftUIDemoApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

- ContentVIew.swift
  - ContentView是实际使用的View，
  - ContentView_Previews是Xcode的预览页面。注意预览界面使用的快捷方式

```swift
/// 实际使用界面
struct ContentView: View {
    var body: some View {
        VStack {
            Text("Hello, world!")
        }
        .padding()
        .background(Color.yellow)
    }
}

/// 测试预览界面：
/// option+command+回车，控制预览界面的显示与否
/// option+command+P：刷新预览
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
```

#### 基本布局和Stack容器

```dart
// alignment内容对齐方式： 右侧
// spacing元素直接的间距
VStack(alignment: .trailing, spacing: 12) {
    Text("0").font(.system(size: 76))
    CalculatorButtonPad()
}
```

如果需要给顶部预留空白，可以加Spacer()

```dart
 VStack(spacing: 12) {
    Spacer()
    Text("0")
        .font(.system(size: 76))
        .minimumScaleFactor(0.5)
        .padding(.trailing, 24)
        .lineLimit(1)
        .frame(minWidth: 0,
               maxWidth: .infinity,
               alignment: .trailing)
    CalculatorButtonPad()
        .padding(.bottom)
}
```

#### ViewModifier

- 什么是ViewModifier？

#### 其他

- padding()
  - padding()会将原view包裹，生成一个“新”的view。所以下面代码，frame放在padding前后导致圆角的结果是不一样的。
  - 最佳实践：如非必要，不要加额外的padding()属性。
```dart
Text("+")
                .font(.title)
                .foregroundColor(.white)
                .frame(width: 44, height: 44)
                .padding()
                .background(Color("customTitleColor"))
                .cornerRadius(22)
            
            Text("+")
                .font(.title)
                .foregroundColor(.white)
                .background(Color.blue)
                .padding()
                .background(Color.orange)
                .frame(width: 44, height: 44)
                .cornerRadius(22)
```

- ForEach语法

ForEach 和swift的for_each是一样的，对数组元素进行遍历，它要求数组中元素满足**Identifiable协议**。为了遵循identifiable协议，只需使元素实现Hashable协议即可。

```swift
ForEach(row, id: \.self) { item in
    CalculatorButton(title: item.title,
                     size: item.size,
                     backgroundColorName: item.backgroundColorName) {
        print("Button: \(item.title)")
    }
}

extension CalculatorButtonItem: Hashable {}
```

- 动画

下面是点击动画。

```swift
VStack{}.onTapGesture {
    withAnimation(
    .spring(response: 0.55, dampingFraction: 0.425, blendDuration: 0)
    ) {
        self.enpandingIndex = self.enpandingIndex == pokemon.id ? nil: pokemon.id
    }
}
```

-


