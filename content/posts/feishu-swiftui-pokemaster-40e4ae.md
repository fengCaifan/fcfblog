---
title: "SwiftUI —— PokeMaster"
date: "2023-10-23"
category: "iOS 与底层"
tags: ["SwiftUI","Swift","网络与安全"]
description: "Cell：PokemonInfoRow 所用控件解析： SwiftUI —— 控件 https://bhhbdrz3p9.feishu.cn/docx/TwT8dfNpKoD46MxgcvBcQ44XnWh 使用一个Vi"
feishu_token: "J5QHdLF60oM9bNxTbenckezin0g"
---

# SwiftUI —— PokeMaster

#### Cell：PokemonInfoRow

所用控件解析：[SwiftUI —— 控件](https://bhhbdrz3p9.feishu.cn/docx/TwT8dfNpKoD46MxgcvBcQ44XnWh) 

> 使用一个View来布局cell的显示。这里可以看到**VStack、HStack、Image、Text、Button**的使用，及背景**background**和渐变色**Gradient**的写法。
> 同时也添加了一个@State属性，表示cell当前是展开还是缩起状态，所以也使用了**Tap动画**。

```swift
struct PokemonInfoRow: View {
//    let model = PokemonViewModel.sample(id: 1)
    
    let model: PokemonViewModel
    @State var expended: Bool
    
    var body: some View {
        VStack {
            HStack {
                Image("Pokemon-\(model.id)")
                    .resizable()
                    .frame(width: 50, height: 50)
                    .aspectRatio(contentMode: .fit)
                    .shadow(radius: 4)
                Spacer()
                VStack(alignment: .trailing, content: {
                    Text(model.name)
                        .font(.title)
                        .fontWeight(.black)
                        .foregroundColor(.white)
                    Text(model.nameEN)
                        .font(.subheadline)
                        .foregroundColor(.white)
                })
            }.padding(.top, 12)
            Spacer()
            HStack(spacing: expended ? 20: -30) {
                Spacer()
                Button(action: {
                    print("fav")
                }, label: {
                    Image(systemName: "star").modifier(ToolButtonModifier())
                })
                Button(action: {
                    print("pannel")
                }, label: {
                    Image(systemName: "chart.bar")
                        .modifier(ToolButtonModifier())
                })
                Button(action: {
                    print("web")
                }, label: {
                    Image(systemName: "info.circle")
                        .modifier(ToolButtonModifier())
                })
            }
            .padding(.bottom, 12)
            .opacity(expended ? 1.0: 0.0)
            .frame(maxHeight: expended ? .infinity: 0)
        }
        .frame(height: expended ? 120: 80)
        .padding(.leading, 23)
        .padding(.trailing, 15)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 20)
                    .stroke(model.color, style: StrokeStyle(lineWidth: 4))
                RoundedRectangle(cornerRadius: 20)
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [.white, model.color]),
                            startPoint: .leading,
                            endPoint: .trailing)
                    )
            }
        )
        .padding(.horizontal)
//        .animation(.default)  隐式动画
        .onTapGesture {
            withAnimation( // 显示动画
                .spring(
                    response: 0.55,
                    dampingFraction: 0.425,
                    blendDuration: 0
                )
            ) {
                self.expended.toggle()
            }
        }
    }
}

struct ToolButtonModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.system(size: 25))
            .foregroundColor(.white)
            .frame(width: 30, height: 30)
    }
}

#Preview {
    VStack {
        PokemonInfoRow(model: .sample(id: 1), expended: false)
        PokemonInfoRow(model: .sample(id: 21), expended: true)
        PokemonInfoRow(model: .sample(id: 24), expended: false)
    }
}
```

#### 列表：PokemonList

> 列表就是作为UITableView的作用，对上面cell的使用。
> 其次为了保证每次点击只有一个cell展开，所以需要将点击事件从cell移到列表里。
> 这里可以学习到**List、ScrollView、LazyVStack**的使用。

```swift
struct PokemonList: View {
    
    // 将选中的展开cell移到列表，以确保每次只有一个cell展开
    @State var enpandingIndex: Int?
    
    var body: some View {
        // List构建一个列表，它接受一个数组，数组中的元素需要遵守Identifiable协议，
        // Identifiable协议有一个id，用于辨别具体的值。这个是UITableView一样。
//        List {
//            ForEach(PokemonViewModel.all) { pokemon in
//                PokemonInfoRow(model: pokemon, expended: false)
//            }
//        }
        ScrollView {
            LazyVStack {
                ForEach(PokemonViewModel.all) { pokemon in
                    PokemonInfoRow(model: pokemon, 
                                   expended: self.enpandingIndex == pokemon.id
                    ).onTapGesture {
                        withAnimation(
                            .spring(response: 0.55, dampingFraction: 0.425, blendDuration: 0)
                        ) {
                            self.enpandingIndex = self.enpandingIndex == pokemon.id ? nil: pokemon.id
                        }
                    }
                }
            }
        }
    }
}

#Preview {
    PokemonList()
}
```

#### 选中弹窗面板

> 弹窗主要就是使用Stack来对简单UI进行布局。
> 这里使用了Extension将大量的代码拆分成了几个文件

```swift
import SwiftUI

struct PokemonInfoPanel: View {
    let model: PokemonViewModel
    
    // 技能
    var ability: [AbilityViewModel] {
        AbilityViewModel.sample(pokemonID: model.id)
    }
    
    // 顶部Indicator
    var topIndicator: some View {
        RoundedRectangle(cornerRadius: 3)
            .frame(width: 40, height: 6)
            .opacity(0.2)
    }
    
    // 详细说明
    var pokemonDescription: some View {
        Text(model.descriptionText)
            .font(.callout)
            .foregroundColor(Color(hex: 0x666666))
            .fixedSize(horizontal: false, vertical: true) // 确保文本能显示全
    }
    
    var body: some View {
        VStack(spacing: 20, content: {
            topIndicator // 顶部指示器
            Header(model: self.model) // 头部
            pokemonDescription // 详情
            Divider()
            AbilityList(model: model, // 技能
                        abilityModels: ability)
        })
        .padding(
            EdgeInsets(top: 12,
                       leading: 30,
                       bottom: 30,
                       trailing: 30)
        )
        .blurBackground(style: .systemMaterial) // 背景
//        .background(Color.white)
        .cornerRadius(20)
        .fixedSize(horizontal: false, vertical: true)
    }
}

import SwiftUI

/// 弹窗头部
extension PokemonInfoPanel {
    struct Header: View {
        let model: PokemonViewModel
        
        // icon
        var pokemonIcon: some View {
            Image("Pokemon-\(model.id)")
                .resizable()
                .frame(width: 68, height: 68)
        }
        // 名称
        var nameSpecies: some View {
            VStack(spacing: 10) {
                VStack {
                    Text(model.name)
                        .font(.system(size: 22))
                        .fontWeight(.bold)
                        .foregroundColor(model.color)
                    
                    Text(model.nameEN)
                        .font(.system(size: 13))
                        .fontWeight(.bold)
                        .foregroundColor(model.color)
                }
                Text(model.genus)
                    .font(.system(size: 13))
                    .fontWeight(.bold)
                    .foregroundColor(.gray)
            }
        }
        // 中间线
        var verticalDivider: some View {
            RoundedRectangle(cornerRadius: 1)
                .frame(width: 1, height: 44)
                .opacity(0.1)
        }
        // 身高体重
        var bodyStatus: some View {
            VStack(alignment: .leading, content: {
                HStack {
                    Text("身高")
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                    Text(model.height)
                        .font(.system(size: 11))
                        .foregroundColor(model.color)
                }
                HStack {
                    Text("体重")
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                    Text(model.weight)
                        .font(.system(size: 11))
                        .foregroundColor(model.color)
                }
            })
        }
        // 类型
        var typeInfo: some View {
            HStack {
                ForEach(self.model.types) { t in
                    ZStack {
                        RoundedRectangle(cornerRadius: 7).fill(t.color).frame(width: 36, height: 14)
                        Text(t.name)
                            .font(.system(size: 10))
                            .foregroundColor(.white)
                    }
                }
            }
        }
        
        var body: some View {
            HStack(spacing: 18, content: {
                pokemonIcon
                nameSpecies
                verticalDivider
                VStack(spacing: 12) {
                    bodyStatus
                    typeInfo
                }
            })
        }
    }
}

import SwiftUI

extension PokemonInfoPanel {
    struct AbilityList: View {
        let model: PokemonViewModel
        let abilityModels: [AbilityViewModel]?
        
        var body: some View {
            VStack(alignment: .leading, content: {
                Text("技能")
                    .font(.headline)
                    .fontWeight(.bold)
                if let abilityModels = abilityModels {
                    ForEach(abilityModels) { ability in
                        Text(ability.name)
                            .font(.subheadline)
                            .foregroundColor(self.model.color)
                        Text(ability.descriptionText)
                            .font(.footnote)
                            .foregroundColor(Color(hex: 0xAAAAAA))
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            })
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}
```

#### 设置页

> 这个页面使用Form表单进行整体布局。期间使用了**Section**来区分块，另外使用的控件包括：**Picker、TextField、SecureField、Toggle**。

```swift
import SwiftUI

class Settings: ObservableObject {
    enum AccountBehavior: CaseIterable {
        case register, login
    }
    
    enum Sorting: CaseIterable {
        case id, name, color, favorite
    }
    
    @Published var accountBehavior = AccountBehavior.login
    @Published var email = ""
    @Published var password = ""
    @Published var verifyPassword = ""
    
    @Published var showEnglishName = true
    @Published var sorting = Sorting.id
    @Published var showFavoriteOnly = false
}

extension Settings.AccountBehavior {
    var text: String {
        switch self {
        case .register:
            return "注册"
        case .login:
            return "登录"
        }
    }
}

extension Settings.Sorting {
    var text: String {
        switch self {
        case .id:
            return "ID"
        case .name:
            return "名字"
        case .color:
            return "颜色"
        case .favorite:
            return "最爱"
        }
    }
}

struct SettingView: View {
    @ObservedObject var settings = Settings()
    
    var body: some View {
        Form {
            accountSection
            optionSection
            actionSection
        }
    }
    
    var accountSection: some View {
        Section(header: Text("账户")) {
            Picker(selection: $settings.accountBehavior, label: Text("")) {
                ForEach(Settings.AccountBehavior.allCases, id: \.self) {
                    Text($0.text)
                }
            }.pickerStyle(SegmentedPickerStyle())
            TextField("电子邮箱", text: $settings.email)
            SecureField("密码", text: $settings.password)
            if settings.accountBehavior == .register {
                SecureField("确认密码", text: $settings.verifyPassword)
            }
            Button(settings.accountBehavior.text) {
                print("登录/注册")
            }
        }
    }
    
    var optionSection: some View {
        Section(header: Text("选项")) {
            Toggle(isOn: $settings.showEnglishName, label: {
                Text("显示英文名")
            })
            Picker(selection: $settings.sorting, label: Text("排列方式")) {
                ForEach(Settings.Sorting.allCases, id: \.self) {
                    Text($0.text)
                }
            }
            Toggle(isOn: $settings.showFavoriteOnly, label: {
                Text("只显示收藏")
            })
        }
    }
    
    var actionSection: some View {
        Section {
            Button(action: {
                print("清空缓存")
            }, label: {
                Text("清空缓存").foregroundColor(.red)
            })
        }
    }
}
```


