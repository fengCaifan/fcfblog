---
title: "SwiftUI控件03 —— Button 按钮、标签与渐变"
date: "2023-11-01"
category: "iOS 与底层"
tags: ["SwiftUI","Swift"]
description: "简单使用 字型与背景 下面代码要注意padding 的使用，如果padding 是在背景background之前，则是先有边距，再有背景，所以背景会覆盖整个按钮。如果padding 是在背景之后，则背景也会产生与按钮的边"
feishu_token: "Y6I4dwuCQokFhGxHNutc1n8onrh"
---

# SwiftUI控件03 —— Button 按钮、标签与渐变

- **简单使用**

```swift
Button {
    print("按钮被点击") // 所需执行的内容
} label: {
    Text("Hello, World!") // 按钮显示外观
}
```

- 字型与背景

> 下面代码要注意padding()的使用，如果padding()是在背景background之前，则是先有边距，再有背景，所以背景会覆盖整个按钮。如果padding()是在背景之后，则背景也会产生与按钮的边距。

```swift
Button {
            print("按钮被点击")
} label: {
            Text("按钮字体与背景")
                .padding() // 文本与按钮直接的边距
                .background(Color.purple) // 背景
                .foregroundColor(.white) // 字体颜色
                .font(.title)
//                .padding() // 文本及颜色都会与按钮有边距
}
```

- 按钮边框
  - 简单边框
![图片](/images/feishu/feishu-swiftui-03-button-3f7206/KsufbI3zLoduQIxgPYpc68kynKf.png)

```swift
Button {
            print("按钮被点击")
        } label: {
            Text("按钮边框")
                .foregroundColor(.purple) // 字体颜色
                .font(.title)
                .padding()
                .border(Color.purple, width: 5) // 边框
        }
```

  - 背景与边框padding
![图片](/images/feishu/feishu-swiftui-03-button-3f7206/N3f3bXgpco4MGyxlvxhcYr4Dn2c.png)

```swift
Button {
            print("按钮被点击")
        } label: {
            Text("按钮边框2")
                .fontWeight(.bold)
                .font(.title)
                .padding()
                .background(Color.purple)
                .foregroundColor(.white)
                .padding(10)
                .border(Color.purple, width: 5)
        }
```

  - 边框和背景都圆角
![图片](/images/feishu/feishu-swiftui-03-button-3f7206/FCeNb34LEo0lOFxJLTIcYeEbnDb.png)

```swift
Button {
            print("按钮被点击")
        } label: {
            Text("按钮边框2")
                .fontWeight(.bold)
                .font(.title)
                .padding()
                .background(Color.purple)
                .cornerRadius(40)
                .foregroundColor(.white)
                .padding(10)
                .overlay {
                    RoundedRectangle(cornerRadius: 40)
                        .stroke(.purple, lineWidth: 5)
                }
        }
```

- **图文按钮**
  - 单独icon图片按钮
```swift
Button {
            print("按钮被点击")
        } label: {
            Image(systemName: "trash")
                .font(.largeTitle)
                .foregroundColor(.red) // icon变成红色
        }
```

  - icon图片圆形背景
```swift
Button {
            print("按钮被点击")
        } label: {
            Image(systemName: "trash")
                .padding()
                .background(.red)
                .clipShape(Circle()) // icon圆形背景
                .font(.largeTitle)
                .foregroundColor(.white)
        }
```

  - icon+text左右排列
![图片](/images/feishu/feishu-swiftui-03-button-3f7206/GJF4bSDOKoiMaMx8IiYcodMZn1c.png)

```swift
Button {
            print("按钮被点击")
        } label: {
            HStack {
                Image(systemName: "trash")
                    .font(.title)
                Text("Delete")
                    .fontWeight(.semibold)
                    .font(.title)
            }
            .padding()
            .foregroundColor(.white)
            .background(.red)
            .cornerRadius(40)
        }
```

  - 使用**Label标签**达到icon+Text的效果
```swift
Button {
            print("按钮被点击")
        } label: {
            Label(
                title: { Text("Delete")
                        .fontWeight(.semibold)
                        .font(.title) },
                icon: { Image(systemName: "trash")
                    .font(.title) }
            )
            .padding()
            .foregroundColor(.white)
            .background(.red)
            .cornerRadius(40)
        }
```

- **渐变背景与阴影**

```swift
Button {
            print("按钮被点击")
        } label: {
            Label(
                title: { Text("Delete")
                        .fontWeight(.semibold)
                        .font(.title) },
                icon: { Image(systemName: "trash")
                    .font(.title) }
            )
            .padding()
            .foregroundColor(.white)
            .background(
                // 从左到右线性渐变
                LinearGradient(gradient: Gradient(colors: [Color.red, Color.blue]),
                               startPoint: .leading, endPoint: .trailing)
            )
            .cornerRadius(40)
            .shadow(color: .gray, radius: 20.0, x: 20, y: 10) // 阴影，需在cornerRadius之后
        }
```

- **全宽度按钮**

```swift
Button {
            print("button clicked")
        } label: {
            HStack {
                Image(systemName: "trash")
                    .font(.title)
                Text("Delete")
                    .font(.title)
                    .fontWeight(.semibold)
            }
            .frame(minWidth: 0, maxWidth: .infinity) // infinity 表示填满容器宽度
            .padding() // 内容与background的边距
            .foregroundColor(.white)
            .background(
                LinearGradient(gradient: Gradient(colors: [Color.green, Color.blue]), startPoint: .leading, endPoint: .trailing)
            )
            .cornerRadius(40)
            .padding(.horizontal, 20) // 左右20边距
```

- **使用ButtonStyle设计按钮**
  - 创建一个结构体，实现ButtonStyle协议
```swift
struct GradientBackgroundStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(minWidth: 0, maxWidth: .infinity)
            .padding()
            .foregroundColor(.white)
            .background(
                LinearGradient(gradient: Gradient(colors: [Color.yellow, Color.blue]), startPoint: .leading, endPoint: .trailing)
            )
            .cornerRadius(40)
            .padding(.horizontal, 20)
            .scaleEffect(configuration.isPressed ? 0.9: 1.0) // 使用configuration的isPressed属性判断当前是否是按下状态，从而改变scale
    }
}
```

  - 通过ButtonStyle生成按钮
```swift
Button {
            print("button clicked")
        } label: {
            HStack {
                Image(systemName: "trash")
                    .font(.title)
                Text("Delete2")
                    .font(.title)
                    .fontWeight(.bold)
            }
        }
        .buttonStyle(GradientBackgroundStyle())
```

  - 额外例子：点击时旋转
```swift
struct RotationEffectStyle: ButtonStyle  {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .foregroundColor(.white)
            .background(Color.purple)
            .clipShape(Circle())
            .cornerRadius(40)
            .rotationEffect(configuration.isPressed ? .degrees(45): .zero) // 按下时旋转
    }
}

        Button {
            print("button clicked")
        } label: {
            Text("+")
                .font(.title)
                .fontWeight(.bold)
        }
        .buttonStyle(RotationEffectStyle())
```

  - **iOS 15默认的一些样式修饰器**
```swift
        Button {
            print("button clicked")
        } label: {
            Text("Button")
        }
        .tint(.purple) // 按钮文本演示
//        .buttonStyle(.borderedProminent) // 背景紫色，文字白色的修饰器
        .buttonStyle(.bordered) // 半透明修饰器
//        .buttonBorderShape(.roundedRectangle(radius: 5)) // 边框形状修饰器：圆角为5的边框
        .buttonBorderShape(.capsule) // 边框胶囊圆形的修饰器
        .controlSize(.regular) // 按钮大小
        
```

    - 将样式应用到多个按钮
```swift
        VStack {
            Button(action: {}, label: {
                Text("Button 01")
                    .font(.headline)
            })
            Button(action: {}, label: {
                Text("Button 02")
                    .font(.headline)
                    .frame(maxWidth: 200)
            })
            Button(action: {}, label: {
                Text("Button 03")
                    .font(.title)
            })
        }
        .buttonStyle(GradientBackgroundStyle())
        .controlSize(.small)
```

    - 按钮角色
```swift
Button("Cancel", role: .cancel) {
    print("button clicked")
}
```


