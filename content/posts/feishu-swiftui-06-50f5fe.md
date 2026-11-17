---
title: "SwiftUI控件06 —— 列表"
date: "2024-10-21"
category: "iOS 与底层"
tags: ["SwiftUI","Swift","渲染与UI"]
description: "List List构建一个列表，类似UITableView，它接受一个数组，数组中的元素需要遵守Identifiable协议， Identifiable协议有一个id，用于辨别具体的值。这个是UITableView一样。"
feishu_token: "Fu4rdH4ogoVV13xygmNctMthnEc"
---

# SwiftUI控件06 —— 列表

#### List

List构建一个列表，类似UITableView，它接受一个数组，数组中的元素需要遵守Identifiable协议，

Identifiable协议有一个id，用于辨别具体的值。这个是UITableView一样。

List有些问题是：1是左右边界很奇怪，暂时不知道什么原因，2是间隔线无法隐藏。

```swift
List(PokemonViewModel.all) { pokemon in
    PokemonInfoRow(model: pokemon, expended: false)
}.padding(0)
```

也可以用ForEach来遍历数据源

```swift
List {
    ForEach(menu) { section in
        Section(header: Text(section.name)) { // 类似UITableView的SectionHeader
            ForEach(section.items) { item in
                IdineItemRow(item: item)
            }
        }
    }
}
.listStyle(.grouped) // 类似TableView的group
```

## 基础用法

#### 简单列表

```swift
struct ListDemo: View {
    var lists = [
        ListItem(name: "111111111", iconName: "star.fill"),
        ListItem(name: "2222222", iconName: "heart"),
        ListItem(name: "3333333", iconName: "trash"),
        ListItem(name: "4444444", iconName: "plus.circle"),
        ListItem(name: "5555555", iconName: "cart"),
        ListItem(name: "6666666", iconName: "person"),
    ]
    
    var body: some View {
        List {
            ForEach(lists) { item in
                HStack {
                    Image(systemName: item.iconName)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 40.tp.fitScreen, height: 40.tp.fitScreen)
                        .cornerRadius(5)
                    Text(item.name)
                        .padding()
                }
            }
        }
        
//        List(lists) { item in
//            Text(item.name)
//                .padding()
//        }
    }
}
```

这种默认情况下，默认是group，整个section，带圆角

- listStyle:

和UITableView一样，对应多种样式

```swift
DefaultListStyle: 自动适应系统样式。
PlainListStyle：用于简单的数据展示，强调内容而非样式。
GroupedListStyle：当需要分组数据并提升可读性时使用。
InsetGroupedListStyle：用于 iPad 或需要强调分隔的应用场景。
SidebarListStyle：在侧边栏展示时，便于用户快速导航。
```

- cell内边距：

cell会默认带有内边距，如果要修改内边距，使用listRowInsets

```swift
ListDemoCell(item: item)
    .listRowInsets(EdgeInsets()) // 设置没过cell 内容内边距
```

- cell背景：

cell背景默认白色，如果要修改背景色，可以使用listRowBackground

注意⚠️：如果直接对cell设置背景色，则只有内容部分背景色生效。（目前没有发现更好的做法）

```swift
ListDemoCell(item: item)
    .listRowBackground(UIColor.g020.color)
```

#### cell分割线：

```plaintext

```

#### 编辑删除：

 实现单条List列表数据的滑动删除，需要使用ForEach的`.onDelete(perform:XXXX)`修饰符。

注意⚠️：这里要对lists做@State，否则会不让修改list。而且如果不使用ForEach，则需要自己添加swipeActions

```swift
.onDelete(perform: { indexSet in
                self.lists.remove(atOffsets: indexSet)
            })
```

#### 编辑拖动：

```swift
.onMove(perform: { indices, newOffset in
                self.lists.move(fromOffsets: indices, toOffset: newOffset)
            })
```


