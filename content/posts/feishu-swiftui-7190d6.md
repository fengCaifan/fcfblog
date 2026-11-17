---
title: "SwiftUI —— 控件"
date: "2023-11-07"
category: "iOS 与底层"
tags: ["SwiftUI","Swift","渲染与UI","网络与安全"]
description: "Navigation SwiftUI控件00 —— NavigationView & NavigationLink https://bhhbdrz3p9.feishu.cn/docx/WCJWdk336oNtQcxVqL"
feishu_token: "TwT8dfNpKoD46MxgcvBcQ44XnWh"
---

# SwiftUI —— 控件

#### Navigation

[SwiftUI控件00 —— NavigationView & NavigationLink ](https://bhhbdrz3p9.feishu.cn/docx/WCJWdk336oNtQcxVqLKcTKkBncd) 

#### TabView (TabBar)

[SwiftUI控件00 —— TabView (TabBar)](https://bhhbdrz3p9.feishu.cn/docx/WtHYdPdL7omMStxnvS7c3iISnsb) 

#### StackView

- VStack & HStack

- ZStack

- LazyVStack & LazyHStack

LazyVStack & LazyHStack可以在需要展示View的时候才创建View，所以只需要在Cell外层包一个LazyVStack，就可以优化Cell的场景时机

```swift
ScrollView {
            LazyVStack {
                ForEach(PokemonViewModel.all) { pokemon in
                    PokemonInfoRow(model: pokemon, expended: false)
                }
            }
        }
```

#### Form

表单，应该需要和Section结合起来用

```swift
var body: some View {
        Form {
            accountSection
            optionSection
            actionSection
        }
    }
```

#### Section

分组

```swift
Section(header: Text("账户")) {
    ...
}
```

##### Text文本

#### UIButton

swiftui中的按钮将事件与样式分离

```dart
// 简单的按钮
Button("x") {
    print("Button x clicked")
}
// Button(action:, label:) 第二个参数label接收一个闭包，这里可以定制Button的view样式
// 将上面的Text声明成一个text变量
Button(action: {
    print("Button + clicked")
}) {
    Image(systemName: "star")
        .font(.system(size: 25))
        .foregroundColor(.white)
        .frame(width: 30, height: 30)
}
```

#### List

[SwiftUI控件06 —— 列表](https://bhhbdrz3p9.feishu.cn/docx/Fu4rdH4ogoVV13xygmNctMthnEc) 

#### ScrollView

```swift
ScrollView {
    ForEach(PokemonViewModel.all) { pokemon in
        PokemonInfoRow(model: pokemon, expended: false)
    }
}
```

#### Picker

[SwiftUI控件07 —— Picker](https://bhhbdrz3p9.feishu.cn/docx/NMJedTrfEogqiqxSC6BcYxvSnOc) 

#### TextField

输入框

```swift
TextField("电子邮箱", text: $settings.email)

TextField("搜索", text: $searchText).frame(height: 40).padding(.horizontal, 25)
```

#### SecureField

密码输入框，可以隐藏

```swift
SecureField("密码", text: $settings.password)
```

#### Toggle

和UIKit的UISwitch一样

```swift
Toggle(isOn: $settings.showFavoriteOnly, label: {
    Text("只显示收藏")
})
```

#### 其他

#### Frame

swiftUI给Frame提供了一个Modified版本。它可以设置宽高的范围。

```dart
func frame(
    minWidth: CGFloat? = nil, 
    idealWidth: CGFloat? = nil, 
    maxWidth: CGFloat? = nil, 
    minHeight: CGFloat? = nil, 
    idealHeight: CGFloat? = nil, 
    maxHeight: CGFloat? = nil, 
    alignment: Alignment = .center 
) !" Self.Modified<_FlexFrameLayout>
```

```dart
Text("0")
    .font(.system(size: 76))
    .frame(
        minWidth: 0,
        maxWidth: .infinity,
        alignment: .trailing
    )
```

- infinity：表示不对最大宽度进行限制，此时Text会尽可能占据容器的宽度，也就是全屏幕宽度。

#### Image

```dart
Image("Pokemon-\(model.id)")
                    .resizable()
                    .frame(width: 50, height: 50)
                    .aspectRatio(contentMode: .fit)
                    .shadow(radius: 4)
```

- resizable() : 按照所在的frame缩放

- aspectRatio：缩放形态

- shadow：为图片增加一些阴影的视觉效果

#### 背景

背景是**background**属性，它可以接受任意遵守View协议的值。

- 单一的颜色

```dart
VStack{}.background(Color.green)
```

- 圆角矩形
```dart
VStack{}.background(
    RoundedRectangle(cornerRadius: 20).fill(Color.green)
)
```

  - 这里的RoundedRectangle（圆角矩阵）也是一个满足Shape协议的类型，而Shape协议本身也满足View协议。同样的形状还有：圆形Circle、矩形Rectangle等。

- 渐变色

在圆角矩形的基础上，使用渐变色进行填充：

- 颜色外框

在上面渐变色的基础上，再加一个圆形矩阵外框，

- 颜色外框+渐变色
```dart
VStack{}.background(
    ZStack {
        RoundedRectangle(cornerRadius: 20)
            .stroke(model.color, style: StrokeStyle(lineWidth: 4))
        RoundedRectangle(cornerRadius: 20)
            .fill(
                LinearGradient(
                    gradient: Gradient(colors: [.white, model.color]),
                        startPoint: .leading,
                        endPoint: .trailing
                )
        )
    }
)
```

  - 因为background只接收一个对象。但是颜色外框+渐变色，相当于要两个对象。而且是在垂直方向上的堆叠。所以这里需要ZStack概括起来。
  -


