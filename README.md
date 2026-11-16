# Caifan's Notes

个人技术笔记与问题排查归档，主要记录 iOS 底层原理、性能优化、工程化架构、跨端开发、数据结构与算法以及网络基础相关的日常总结。

## 本地运行

安装依赖并启动本地服务（默认端口 `2027`）：

```bash
npm install
npm run dev
```

浏览器访问 `http://localhost:2027`。

## 目录说明

- `content/posts/`：Markdown 格式的技术笔记正文
- `app/`：Next.js 页面路由与全局样式
- `src/components/`：文章归档列表与知识关联图谱组件
- `src/lib/`：Markdown 解析与静态索引构建逻辑
