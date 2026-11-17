#!/usr/bin/env node
/**
 * 飞书文档拉取、智能查重与手动审核导入工具
 *
 * 用法：
 *   1. 配置环境变量（写在 fcfblog/.env.local 中）：
 *      FEISHU_APP_ID=cli_xxxxxx
 *      FEISHU_APP_SECRET=xxxxxx
 *      # 可选：指定要拉取的云空间文件夹 token、知识库 ID 或单篇文档链接/token（逗号分隔）
 *      FEISHU_FOLDER_TOKENS=fldcnxxxxxx
 *      FEISHU_WIKI_SPACE_IDS=7xxxxxx
 *      FEISHU_DOC_TOKENS=https://xxx.feishu.cn/docx/doxcnxxxxxx
 *      # 可选：若不想把应用机器人加进文件夹协作者，可直接填个人 user_access_token
 *      FEISHU_USER_ACCESS_TOKEN=u-xxxxxx
 *
 *   2. 拉取并生成查重审核清单（暂存到 .feishu-staging/，不会直接改动 content/posts/）：
 *      npm run feishu:pull
 *
 *   3. 打开 .feishu-staging/REVIEW.md 勾选 [x] 要发布的文章，然后执行导入：
 *      npm run feishu:import
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT_DIR, "content", "posts");
const STAGING_DIR = path.join(ROOT_DIR, ".feishu-staging");
const STAGING_POSTS_DIR = path.join(STAGING_DIR, "posts");
const REVIEW_FILE = path.join(STAGING_DIR, "REVIEW.md");
const MANIFEST_FILE = path.join(STAGING_DIR, "manifest.json");
const IMAGES_DIR = path.join(ROOT_DIR, "public", "images", "feishu");

// 加载 .env.local / .env
function loadEnv() {
  for (const envName of [".env.local", ".env"]) {
    const envPath = path.join(ROOT_DIR, envName);
    if (!fs.existsSync(envPath)) continue;
    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const FEISHU_BASE = (process.env.FEISHU_BASE_URL || "https://open.feishu.cn").replace(/\/$/, "");

// 飞书代码块语言枚举映射
const CODE_LANG_MAP = {
  1: "plaintext",
  2: "abap",
  3: "ada",
  4: "apache",
  5: "apex",
  6: "assembly",
  7: "bash",
  8: "csharp",
  9: "cpp",
  10: "c",
  11: "cobol",
  12: "css",
  13: "coffeescript",
  14: "d",
  15: "dart",
  16: "delphi",
  17: "django",
  18: "dockerfile",
  19: "erlang",
  20: "fortran",
  21: "foxpro",
  22: "go",
  23: "groovy",
  24: "html",
  25: "haskell",
  26: "http",
  27: "json",
  28: "json",
  29: "java",
  30: "javascript",
  31: "julia",
  32: "kotlin",
  33: "latex",
  34: "lisp",
  35: "logo",
  36: "lua",
  37: "makefile",
  38: "markdown",
  39: "matlab",
  40: "nginx",
  41: "objc",
  42: "ocaml",
  43: "perl",
  44: "php",
  45: "powershell",
  46: "prolog",
  47: "protobuf",
  48: "python",
  49: "python",
  50: "r",
  51: "rpm",
  52: "ruby",
  53: "rust",
  54: "sas",
  55: "scala",
  56: "bash",
  57: "sql",
  58: "swift",
  59: "thrift",
  60: "bash",
  61: "swift",
  62: "typescript",
  63: "typescript",
  64: "xml",
  65: "yaml",
};

async function getAccessToken() {
  if (process.env.FEISHU_USER_ACCESS_TOKEN) {
    return {
      token: process.env.FEISHU_USER_ACCESS_TOKEN.trim(),
      mode: "user_access_token",
    };
  }
  const appId = process.env.FEISHU_APP_ID?.trim();
  const appSecret = process.env.FEISHU_APP_SECRET?.trim();
  if (!appId || !appSecret) {
    throw new Error(
      "未检测到飞书凭证。请在 fcfblog/.env.local 中配置 FEISHU_APP_ID 和 FEISHU_APP_SECRET（或 FEISHU_USER_ACCESS_TOKEN）。"
    );
  }
  const res = await fetch(
    `${FEISHU_BASE}/open-apis/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );
  const data = await res.json();
  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`获取飞书 tenant_access_token 失败: ${JSON.stringify(data)}`);
  }
  return {
    token: data.tenant_access_token,
    mode: "tenant_access_token",
  };
}

async function feishuGet(token, apiPath, query = {}) {
  const url = new URL(`${FEISHU_BASE}${apiPath}`);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (data.code !== 0) {
    throw new Error(`飞书 API 请求失败 [${apiPath}]: code=${data.code}, msg=${data.msg}`);
  }
  return data.data;
}

// 从 URL 或纯 token 中解析出 token 和类型
function parseFeishuInputToken(raw) {
  const s = raw.trim();
  if (!s) return null;
  const docxMatch = s.match(/\/docx\/([A-Za-z0-9_-]+)/);
  if (docxMatch) return { type: "docx", token: docxMatch[1] };
  const wikiMatch = s.match(/\/wiki\/([A-Za-z0-9_-]+)/);
  if (wikiMatch) return { type: "wiki", token: wikiMatch[1] };
  const folderMatch = s.match(/\/folder\/([A-Za-z0-9_-]+)/);
  if (folderMatch) return { type: "folder", token: folderMatch[1] };
  return { type: "unknown", token: s };
}

// 递归列出云空间文件夹中的所有 docx 文档
async function listFolderDocs(accessToken, folderToken, visited = new Set()) {
  if (visited.has(folderToken)) return [];
  visited.add(folderToken);

  const docs = [];
  let pageToken = "";
  do {
    const data = await feishuGet(accessToken, "/open-apis/drive/v1/files", {
      folder_token: folderToken,
      page_size: 200,
      page_token: pageToken,
    });
    const files = data?.files || [];
    for (const file of files) {
      if (file.type === "folder") {
        const subDocs = await listFolderDocs(accessToken, file.token, visited);
        docs.push(...subDocs);
      } else if (file.type === "docx") {
        docs.push({
          docToken: file.token,
          title: file.name || "",
          createdTime: file.created_time ? Number(file.created_time) * 1000 : Date.now(),
          modifiedTime: file.modified_time ? Number(file.modified_time) * 1000 : Date.now(),
          source: `folder:${folderToken}`,
        });
      }
    }
    pageToken = data?.next_page_token || "";
  } while (pageToken);

  return docs;
}

// 递归列出知识库（Wiki）中的所有 docx 节点
async function listWikiNodes(accessToken, spaceId, parentNodeToken = "") {
  const docs = [];
  let pageToken = "";
  do {
    const data = await feishuGet(
      accessToken,
      `/open-apis/wiki/v2/spaces/${spaceId}/nodes`,
      {
        parent_node_token: parentNodeToken || undefined,
        page_size: 50,
        page_token: pageToken,
      }
    );
    const items = data?.items || [];
    for (const item of items) {
      if (item.obj_type === "docx" && item.obj_token) {
        docs.push({
          docToken: item.obj_token,
          title: item.title || "",
          createdTime: item.obj_create_time ? Number(item.obj_create_time) * 1000 : Date.now(),
          modifiedTime: item.obj_edit_time ? Number(item.obj_edit_time) * 1000 : Date.now(),
          source: `wiki:${spaceId}`,
        });
      }
      if (item.has_child) {
        const children = await listWikiNodes(accessToken, spaceId, item.node_token);
        docs.push(...children);
      }
    }
    pageToken = data?.page_token || "";
  } while (pageToken);
  return docs;
}

// 获取单篇 docx 的所有块
async function fetchDocxBlocks(accessToken, documentId) {
  const blocks = [];
  let pageToken = "";
  do {
    const data = await feishuGet(
      accessToken,
      `/open-apis/docx/v1/documents/${documentId}/blocks`,
      {
        page_size: 500,
        page_token: pageToken,
      }
    );
    if (Array.isArray(data?.items)) {
      blocks.push(...data.items);
    }
    pageToken = data?.page_token || "";
  } while (pageToken);
  return blocks;
}

// 下载飞书文档内的图片到本地 public/images/feishu/<slug>/
async function downloadFeishuMedia(accessToken, mediaToken, slug) {
  try {
    const targetDir = path.join(IMAGES_DIR, slug);
    fs.mkdirSync(targetDir, { recursive: true });
    const res = await fetch(
      `${FEISHU_BASE}/open-apis/drive/v1/medias/${mediaToken}/download`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    let ext = ".png";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = ".jpg";
    else if (contentType.includes("gif")) ext = ".gif";
    else if (contentType.includes("webp")) ext = ".webp";
    else if (contentType.includes("svg")) ext = ".svg";

    const fileName = `${mediaToken}${ext}`;
    const filePath = path.join(targetDir, fileName);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buf);
    return `/images/feishu/${slug}/${fileName}`;
  } catch {
    return null;
  }
}

// 渲染飞书富文本元素（TextRun / Equation / MentionDoc）
function renderElements(elements = []) {
  let out = "";
  for (const el of elements) {
    if (el.text_run) {
      let content = el.text_run.content || "";
      const style = el.text_run.text_element_style || {};
      if (!content) continue;
      if (style.inline_code) {
        content = `\`${content.replace(/`/g, "\\`")}\``;
      } else {
        if (style.bold) content = `**${content}**`;
        if (style.italic) content = `*${content}*`;
        if (style.strikethrough) content = `~~${content}~~`;
      }
      if (style.link?.url) {
        const decodedUrl = decodeURIComponent(style.link.url);
        content = `[${content}](${decodedUrl})`;
      }
      out += content;
    } else if (el.equation) {
      const expr = (el.equation.content || "").trim();
      if (expr) out += `$${expr}$`;
    } else if (el.mention_doc) {
      const title = el.mention_doc.title || "飞书文档";
      const url = el.mention_doc.url ? decodeURIComponent(el.mention_doc.url) : "";
      out += url ? `[${title}](${url})` : title;
    }
  }
  return out;
}

// 将飞书 Docx Block 树转换为 Markdown
async function convertBlocksToMarkdown(blocks, accessToken, slug) {
  const blockMap = new Map();
  for (const b of blocks) {
    blockMap.set(b.block_id, b);
  }
  const root = blocks.find((b) => b.block_type === 1) || blocks[0];
  if (!root) return { title: "", markdown: "" };

  const docTitle = renderElements(root.page?.elements || []).trim();
  const lines = [];

  async function renderBlock(blockId, indentLevel = 0) {
    const block = blockMap.get(blockId);
    if (!block) return;
    const t = block.block_type;
    const indent = "  ".repeat(indentLevel);

    // 2: Text
    if (t === 2) {
      const text = renderElements(block.text?.elements);
      lines.push(`${indent}${text}`, "");
    }
    // 3..11: Heading 1..9
    else if (t >= 3 && t <= 11) {
      const level = Math.min(t - 1, 6); // H1 用在文章标题，正文从 H2 (##) 开始更协调
      const key = `heading${t - 2}`;
      const text = renderElements(block[key]?.elements).trim();
      if (text) {
        lines.push(`${"#".repeat(level)} ${text}`, "");
      }
    }
    // 12: Bullet List
    else if (t === 12) {
      const text = renderElements(block.bullet?.elements);
      lines.push(`${indent}- ${text}`);
      for (const childId of block.children || []) {
        await renderBlock(childId, indentLevel + 1);
      }
      if (indentLevel === 0) lines.push("");
    }
    // 13: Ordered List
    else if (t === 13) {
      const text = renderElements(block.ordered?.elements);
      lines.push(`${indent}1. ${text}`);
      for (const childId of block.children || []) {
        await renderBlock(childId, indentLevel + 1);
      }
      if (indentLevel === 0) lines.push("");
    }
    // 14: Code Block
    else if (t === 14) {
      const langCode = block.code?.style?.language || 1;
      const lang = CODE_LANG_MAP[langCode] || "plaintext";
      const codeText = (block.code?.elements || [])
        .map((e) => e.text_run?.content || "")
        .join("");
      lines.push(`\`\`\`${lang}`, codeText.replace(/\n$/, ""), "```", "");
    }
    // 15: Quote
    else if (t === 15) {
      const text = renderElements(block.quote?.elements);
      lines.push(`> ${text}`, "");
    }
    // 17: Todo
    else if (t === 17) {
      const done = block.todo?.style?.done ? "x" : " ";
      const text = renderElements(block.todo?.elements);
      lines.push(`${indent}- [${done}] ${text}`);
    }
    // 19: Callout / 34: Quote Container
    else if (t === 19 || t === 34) {
      const subLines = [];
      for (const childId of block.children || []) {
        const child = blockMap.get(childId);
        if (!child) continue;
        const text =
          renderElements(
            child.text?.elements ||
              child.bullet?.elements ||
              child.ordered?.elements ||
              []
          ).trim();
        if (text) subLines.push(`> ${text}`);
      }
      if (subLines.length > 0) {
        lines.push(...subLines, "");
      }
    }
    // 22: Divider
    else if (t === 22) {
      lines.push("---", "");
    }
    // 27: Image
    else if (t === 27) {
      const mediaToken = block.image?.token;
      if (mediaToken) {
        const localUrl = await downloadFeishuMedia(accessToken, mediaToken, slug);
        if (localUrl) {
          lines.push(`![图片](${localUrl})`, "");
        }
      }
    }
    // 31: Table
    else if (t === 31) {
      const colSize = block.table?.property?.column_size || 0;
      const cellIds = block.table?.cells || [];
      if (colSize > 0 && cellIds.length > 0) {
        const rows = [];
        for (let i = 0; i < cellIds.length; i += colSize) {
          const rowCells = cellIds.slice(i, i + colSize).map((cellId) => {
            const cellBlock = blockMap.get(cellId);
            const cellTexts = [];
            for (const cId of cellBlock?.children || []) {
              const cb = blockMap.get(cId);
              const txt = renderElements(cb?.text?.elements || []).trim();
              if (txt) cellTexts.push(txt.replace(/\|/g, "\\|"));
            }
            return cellTexts.join(" ") || " ";
          });
          rows.push(rowCells);
        }
        if (rows.length > 0) {
          lines.push(`| ${rows[0].join(" | ")} |`);
          lines.push(`| ${rows[0].map(() => "---").join(" | ")} |`);
          for (const r of rows.slice(1)) {
            lines.push(`| ${r.join(" | ")} |`);
          }
          lines.push("");
        }
      }
    }
    // 其他容器节点递归处理子节点
    else if (Array.isArray(block.children)) {
      for (const childId of block.children) {
        await renderBlock(childId, indentLevel);
      }
    }
  }

  for (const childId of root.children || []) {
    await renderBlock(childId, 0);
  }

  const markdown = lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { title: docTitle, markdown };
}

// 自动推断分类与标签
function inferCategoryAndTags(title, content) {
  const t = title.toLowerCase();
  const combined = `${title}\n${content.slice(0, 1500)}`.toLowerCase();

  let category = "iOS 与底层";
  if (
    /剑指\s*offer|^题\s*\d+|算法|链表|二叉树|动态规划|回溯法|双指针|优先级队列|^堆$|bfs|dfs|二分法/.test(
      t
    )
  ) {
    category = "算法与数据结构";
  } else if (
    /大模型|agent|llm|prompt|rag|cursor/.test(t) ||
    combined.includes("langchain")
  ) {
    category = "AI 与 Agent";
  } else if (
    /^go|gin|mysql|后端|blog项目/.test(t)
  ) {
    category = "后端与 Go";
  } else if (
    /vue|react|html|css|javascript|小程序|wxml|wxss|^npm|flex布局|渲染组件列表/.test(
      t
    )
  ) {
    category = "前端与小程序";
  } else if (/flutter|dart|widget/.test(t)) {
    category = "Flutter 与跨端";
  } else if (
    /设计模式|状态模式|访问者模式|模板方法模式|策略模式|观察者模式|备忘录模式|中介者模式|迭代器模式|命令模式|责任链模式|代理模式|享元模式|外观模式|装饰器模式|组合模式|桥接模式|架构|重构|组件化/.test(
      t
    )
  ) {
    category = "工程架构";
  } else if (
    /卡顿|崩溃|crash|foom|oom|内存优化|内存检测|野指针|性能|启动优化/.test(t)
  ) {
    category = "性能与稳定性";
  } else if (
    /^git|charles|iterm2|find命令|sed\s*命令|^pod\s|swiftgen|swiftlint|code review|开发规范|流程图|经验总结/.test(
      t
    )
  ) {
    category = "工程效率与工具";
  }

  const tagRules = [
    ["SwiftUI", /swiftui/i],
    ["Combine", /combine/i],
    ["Swift", /swift|codable|optional|闭包|柯里化|propertywrapper/i],
    ["Objective-C", /objc|objective-c|\boc\b|runtime|isa|msg_send|kvo|kvc|block/i],
    ["内存管理", /arc|mrc|autorelease|weak|foom|oom|内存|野指针/i],
    ["多线程与并发", /gcd|nsoperation|锁|线程|并发|goroutine/i],
    ["RunLoop", /runloop/i],
    ["渲染与UI", /uikit|calayer|离屏渲染|tableview|collectionview|stackview/i],
    ["性能与稳定性", /卡顿|耗时|性能|启动|oom|foom|crash|崩溃/i],
    ["网络与安全", /http|https|tcp|dns|charles|rsa|加密|验签|apns|universallink|deeplink/i],
    ["设计模式", /设计模式|模式/i],
    ["Go", /\bgo\b|golang|gin/i],
    ["Vue / 前端", /vue|react|html|css|javascript|npm/i],
    ["微信小程序", /小程序|wxml|wxss/i],
    ["MySQL", /mysql|数据库/i],
    ["Flutter", /flutter|dart|widget/i],
    ["AI Agent", /agent|llm|prompt|rag|大模型|cursor/i],
    ["剑指Offer", /剑指|^题\s*\d+/i],
    ["算法与数据结构", /算法|链表|二叉树|排序|动态规划|回溯|双指针|堆|队列|递归/i],
    ["工程效率", /git|xcode|pod|iterm|charles|find|sed|ci\/cd/i],
  ];

  const tags = [];
  for (const [tag, regex] of tagRules) {
    if (regex.test(title) || regex.test(combined.slice(0, 600))) {
      tags.push(tag);
    }
    if (tags.length >= 4) break;
  }
  if (tags.length === 0) tags.push("技术笔记");

  return { category, tags };
}

// 文本归一化与无漂移 4-gram 集合构建
function normalizeText(str) {
  return str
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*`~\-\[\]()!|：:、，。？?！!（）()《》“”"']/g, " ")
    .replace(/\s+/g, "");
}

function normalizeTitleCore(title) {
  return title
    .toLowerCase()
    .replace(/^[0-9一二三四五六七八九十]+[、.．:：\s-]*/g, "")
    .replace(/完全学习指南|完全指南|学习指南|学习笔记|核心笔记|详解|总结|整理|笔记/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "");
}

function buildShingles(normStr, k = 4) {
  const set = new Set();
  if (!normStr) return set;
  if (normStr.length < k) {
    set.add(normStr);
    return set;
  }
  for (let i = 0; i <= normStr.length - k; i++) {
    set.add(normStr.slice(i, i + k));
  }
  return set;
}

function calcJaccard(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const item of setA) {
    if (setB.has(item)) inter++;
  }
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

function calcContainment(smallSet, largeSet) {
  if (smallSet.size === 0 || largeSet.size === 0) return 0;
  let inter = 0;
  for (const item of smallSet) {
    if (largeSet.has(item)) inter++;
  }
  return inter / smallSet.size;
}

function isScratchOrInterviewDoc(title) {
  return /^(111|test)$/i.test(title.trim()) ||
    /todo|面试|题库|学习路径|优质学习资源|第三方链接/i.test(title);
}

function walkMdFiles(dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMdFiles(full, result);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      result.push(full);
    }
  }
  return result;
}

function loadExistingPostsIndex() {
  const index = [];
  // 1. 博客已发布的 68 篇文章
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
      const title = titleMatch ? titleMatch[1].trim() : file.replace(/\.md$/, "");
      const body = raw.replace(/^---[\s\S]*?---\n*/, "");
      const normTitle = normalizeTitleCore(title);
      const normBody = normalizeText(body);
      index.push({
        file: `content/posts/${file}`,
        title,
        normTitle,
        titleShingles: buildShingles(normTitle, 2),
        bodyShingles: buildShingles(normBody, 4),
      });
    }
  }

  // 2. 本地仓库原始笔记目录（用于识别已合并进《iOS底层知识体系》或《知识小集》的旧飞书笔记）
  const workspaceRoot = path.resolve(ROOT_DIR, "..");
  for (const repoDir of ["iOSLearningSet", "AlgorithmLearningSet", "AI Agent Learning"]) {
    const fullRepoDir = path.join(workspaceRoot, repoDir);
    const mdFiles = walkMdFiles(fullRepoDir);
    for (const fullPath of mdFiles) {
      const relPath = path.relative(workspaceRoot, fullPath);
      const raw = fs.readFileSync(fullPath, "utf8");
      const baseTitle = path.basename(fullPath, ".md");
      const h1Match = raw.match(/^#\s+(.+)$/m);
      const title = h1Match ? h1Match[1].trim() : baseTitle;
      const normTitle = normalizeTitleCore(title);
      const normBody = normalizeText(raw);
      index.push({
        file: relPath,
        title,
        normTitle,
        titleShingles: buildShingles(normTitle, 2),
        bodyShingles: buildShingles(normBody, 4),
      });
    }
  }

  return index;
}

function compareWithExisting(title, markdown, existingIndex) {
  const normTitle = normalizeTitleCore(title);
  const normBody = normalizeText(markdown);
  const titleShingles = buildShingles(normTitle, 2);
  const bodyShingles = buildShingles(normBody, 4);

  let bestMatch = null;
  let bestRankScore = -1;

  for (const post of existingIndex) {
    let titleSim = calcJaccard(titleShingles, post.titleShingles);
    if (
      normTitle.length >= 4 &&
      post.normTitle.length >= 4 &&
      (post.normTitle.includes(normTitle) || normTitle.includes(post.normTitle))
    ) {
      titleSim = Math.max(titleSim, 0.85);
    }
    const bodyJaccard = calcJaccard(bodyShingles, post.bodyShingles);
    const bodyContainment = calcContainment(bodyShingles, post.bodyShingles);
    const rankScore = Math.max(
      bodyContainment,
      bodyJaccard,
      titleSim * 0.7 + bodyContainment * 0.3
    );

    if (rankScore > bestRankScore) {
      bestRankScore = rankScore;
      bestMatch = {
        file: post.file,
        title: post.title,
        titleSim: Math.round(titleSim * 100),
        bodyContainment: Math.round(bodyContainment * 100),
        bodyJaccard: Math.round(bodyJaccard * 100),
        score: Math.round(rankScore * 100),
      };
    }
  }

  let status = "NEW";
  if (bestMatch) {
    if (
      bestMatch.bodyContainment >= 50 ||
      bestMatch.bodyJaccard >= 40 ||
      (bestMatch.titleSim >= 75 && bestMatch.bodyContainment >= 15)
    ) {
      status = "DUPLICATE";
    } else if (
      bestMatch.bodyContainment >= 20 ||
      bestMatch.titleSim >= 55
    ) {
      status = "PARTIAL";
    }
  }
  if (status === "NEW" && isScratchOrInterviewDoc(title)) {
    status = "SCRATCH";
  }

  return { status, bestMatch };
}

function makeSlug(title, docToken) {
  const ascii = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const shortHash = crypto
    .createHash("md5")
    .update(docToken)
    .digest("hex")
    .slice(0, 6);
  return ascii.length >= 4 ? `feishu-${ascii}-${shortHash}` : `feishu-note-${shortHash}`;
}

async function collectTargetDocs(accessToken) {
  const collected = new Map();

  // 1. 显式指定的单篇文档 Token / 链接
  const rawDocTokens = (process.env.FEISHU_DOC_TOKENS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const raw of rawDocTokens) {
    const parsed = parseFeishuInputToken(raw);
    if (!parsed) continue;
    if (parsed.type === "wiki") {
      const nodeData = await feishuGet(accessToken, "/open-apis/wiki/v2/spaces/get_node", {
        token: parsed.token,
      });
      const node = nodeData?.node;
      if (node?.obj_type === "docx" && node?.obj_token) {
        collected.set(node.obj_token, {
          docToken: node.obj_token,
          title: node.title || "",
          createdTime: Date.now(),
          modifiedTime: Date.now(),
          source: `wiki-node:${parsed.token}`,
        });
      }
    } else {
      collected.set(parsed.token, {
        docToken: parsed.token,
        title: "",
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        source: `doc:${parsed.token}`,
      });
    }
  }

  // 2. 显式指定的云空间文件夹 Token / 链接
  const rawFolderTokens = (process.env.FEISHU_FOLDER_TOKENS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const raw of rawFolderTokens) {
    const parsed = parseFeishuInputToken(raw);
    if (!parsed) continue;
    const docs = await listFolderDocs(accessToken, parsed.token);
    for (const d of docs) collected.set(d.docToken, d);
  }

  // 3. 显式指定的知识库 Space ID，或自动发现应用可见的所有知识库
  const rawSpaceIds = (process.env.FEISHU_WIKI_SPACE_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawSpaceIds.length > 0) {
    for (const spaceId of rawSpaceIds) {
      const docs = await listWikiNodes(accessToken, spaceId);
      for (const d of docs) collected.set(d.docToken, d);
    }
  } else {
    // 自动扫描应用有权限访问的全部知识库
    try {
      const spaceData = await feishuGet(accessToken, "/open-apis/wiki/v2/spaces", {
        page_size: 50,
      });
      for (const space of spaceData?.items || []) {
        const docs = await listWikiNodes(accessToken, space.space_id);
        for (const d of docs) collected.set(d.docToken, d);
      }
    } catch {
      // 若未开通 wiki:wiki:readonly 权限则跳过
    }
  }

  // 4. 若还未指定任何入口，尝试扫描根目录云空间文件
  if (collected.size === 0) {
    try {
      const rootDocs = await listFolderDocs(accessToken, "");
      for (const d of rootDocs) collected.set(d.docToken, d);
    } catch {
      // 忽略
    }
  }

  return Array.from(collected.values());
}

async function runPull() {
  console.log("🔑 正在校验飞书开发者凭证...");
  const { token: accessToken, mode } = await getAccessToken();
  console.log(`✅ 凭证校验成功（认证模式: ${mode}）`);

  console.log("📂 正在扫描可读取的飞书技术文档...");
  const docs = await collectTargetDocs(accessToken);
  if (docs.length === 0) {
    console.log(
      "\n⚠️ 未扫描到任何飞书文档。请确认以下任一配置已完成：\n" +
        "  方式 A（推荐）：在飞书云空间文件夹或知识库右上角「... -> 添加协作者/成员」中搜索添加你的飞书自建应用，并在 .env.local 中填入 FEISHU_FOLDER_TOKENS=文件夹链接；\n" +
        "  方式 B：在 .env.local 中填入 FEISHU_DOC_TOKENS=文档链接1,文档链接2；\n" +
        "  方式 C：在 .env.local 中填入个人的 FEISHU_USER_ACCESS_TOKEN 直接拉取个人云空间。"
    );
    return;
  }

  console.log(`📄 共发现 ${docs.length} 篇飞书文档，开始拉取正文并与本地文章查重...`);
  fs.mkdirSync(STAGING_POSTS_DIR, { recursive: true });
  const existingIndex = loadExistingPostsIndex();
  const manifest = [];

  for (let i = 0; i < docs.length; i++) {
    const item = docs[i];
    try {
      const blocks = await fetchDocxBlocks(accessToken, item.docToken);
      const slug = makeSlug(item.title || item.docToken, item.docToken);
      const { title: blockTitle, markdown } = await convertBlocksToMarkdown(
        blocks,
        accessToken,
        slug
      );
      const finalTitle = (item.title || blockTitle || `飞书笔记-${item.docToken}`).trim();
      if (!markdown || markdown.length < 20) {
        console.log(`  ⏭️ [${i + 1}/${docs.length}] 跳过空文档: 《${finalTitle}》`);
        continue;
      }

      const { category, tags } = inferCategoryAndTags(finalTitle, markdown);
      const dateStr = new Date(item.modifiedTime || Date.now()).toISOString().slice(0, 10);
      const plainSummary = markdown
        .replace(/```[\s\S]*?```/g, "")
        .replace(/[#>*`~\-\[\]()!|]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 110);

      const frontmatter = [
        "---",
        `title: ${JSON.stringify(finalTitle)}`,
        `date: "${dateStr}"`,
        `category: "${category}"`,
        `tags: ${JSON.stringify(tags)}`,
        `description: ${JSON.stringify(plainSummary)}`,
        `feishu_token: "${item.docToken}"`,
        "---",
        "",
        `# ${finalTitle}`,
        "",
        markdown,
        "",
      ].join("\n");

      const fileName = `${slug}.md`;
      fs.writeFileSync(path.join(STAGING_POSTS_DIR, fileName), frontmatter, "utf8");

      const dupCheck = compareWithExisting(finalTitle, markdown, existingIndex);
      manifest.push({
        fileName,
        title: finalTitle,
        date: dateStr,
        category,
        tags,
        docToken: item.docToken,
        status: dupCheck.status,
        bestMatch: dupCheck.bestMatch,
      });

      const badge =
        dupCheck.status === "NEW"
          ? "🟢 全新"
          : dupCheck.status === "PARTIAL"
          ? "🟡 部分重合"
          : "🔴 疑似重复";
      console.log(`  ${badge} [${i + 1}/${docs.length}] 《${finalTitle}》 -> ${fileName}`);
    } catch (err) {
      console.error(`  ❌ [${i + 1}/${docs.length}] 拉取失败 (${item.docToken}): ${err.message}`);
    }
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), "utf8");
  writeReviewMarkdown(manifest);
  console.log(`\n✨ 拉取与查重完成！`);
  console.log(`📋 请打开审核清单查看查重结果并勾选要发布的文章：`);
  console.log(`   ${REVIEW_FILE}`);
  console.log(`🚀 确认勾选无误后，执行以下命令即可正式合入博客：`);
  console.log(`   npm run feishu:import`);
}

function writeReviewMarkdown(manifest) {
  const newDocs = manifest.filter((m) => m.status === "NEW");
  const partialDocs = manifest.filter((m) => m.status === "PARTIAL");
  const scratchDocs = manifest.filter((m) => m.status === "SCRATCH");
  const dupDocs = manifest.filter((m) => m.status === "DUPLICATE");

  const lines = [
    "# 飞书文档拉取与查重审核清单",
    "",
    "在下方通过 `[x]`（导入）或 `[ ]`（不导入）勾选你要发布到博客的文章，保存后运行 `npm run feishu:import` 即可正式复制到 `content/posts/`。",
    "",
    `## 🟢 全新独立文章（共 ${newDocs.length} 篇，默认勾选导入）`,
    "",
  ];

  if (newDocs.length === 0) {
    lines.push("_暂无_", "");
  } else {
    // 按分类分组展示，方便阅读与批量勾选
    const byCat = new Map();
    for (const item of newDocs) {
      if (!byCat.has(item.category)) byCat.set(item.category, []);
      byCat.get(item.category).push(item);
    }
    for (const [cat, items] of byCat.entries()) {
      lines.push(`### ${cat}（${items.length} 篇）`, "");
      for (const item of items) {
        lines.push(
          `- [x] **${item.title}** (\`${item.fileName}\`)`,
          `  - 日期：\`${item.date}\` | 标签：\`${item.tags.join(", ")}\` | 暂存预览：\`.feishu-staging/posts/${item.fileName}\``
        );
      }
      lines.push("");
    }
  }

  lines.push(`## 🟡 与本地文章存在部分内容重合（共 ${partialDocs.length} 篇，默认不勾选，请人工确认）`, "");
  if (partialDocs.length === 0) {
    lines.push("_暂无_", "");
  } else {
    for (const item of partialDocs) {
      lines.push(
        `- [ ] **${item.title}** (\`${item.fileName}\`)`,
        `  - 疑似重合本地文档：《${item.bestMatch.title}》(\`${item.bestMatch.file}\`)`,
        `  - 标题相似度：${item.bestMatch.titleSim}% | 正文片段包含率：${item.bestMatch.bodyContainment}% | 暂存预览：\`.feishu-staging/posts/${item.fileName}\``
      );
    }
    lines.push("");
  }

  lines.push(`## ⚪ 面试准备 / TODO / 资源汇总 / 随手草稿（共 ${scratchDocs.length} 篇，默认不勾选）`, "");
  if (scratchDocs.length === 0) {
    lines.push("_暂无_", "");
  } else {
    for (const item of scratchDocs) {
      lines.push(
        `- [ ] **${item.title}** (\`${item.fileName}\`)`,
        `  - 分类：\`${item.category}\` | 日期：\`${item.date}\` | 暂存预览：\`.feishu-staging/posts/${item.fileName}\``
      );
    }
    lines.push("");
  }

  lines.push(`## 🔴 与本地文章高度重复（共 ${dupDocs.length} 篇，已自动跳过）`, "");
  if (dupDocs.length === 0) {
    lines.push("_暂无_", "");
  } else {
    for (const item of dupDocs) {
      lines.push(
        `- [ ] **${item.title}** (\`${item.fileName}\`)`,
        `  - 匹配本地文档：《${item.bestMatch.title}》(\`${item.bestMatch.file}\`)`,
        `  - 标题相似度：${item.bestMatch.titleSim}% | 正文片段包含率：${item.bestMatch.bodyContainment}%`
      );
    }
    lines.push("");
  }

  fs.writeFileSync(REVIEW_FILE, lines.join("\n"), "utf8");
}

function runRecheck() {
  if (!fs.existsSync(STAGING_POSTS_DIR)) {
    throw new Error("未找到 .feishu-staging/posts 目录，请先执行 pull");
  }
  const existingIndex = loadExistingPostsIndex();
  const files = fs.readdirSync(STAGING_POSTS_DIR).filter((f) => f.endsWith(".md"));
  const manifest = [];

  for (const fileName of files) {
    const filePath = path.join(STAGING_POSTS_DIR, fileName);
    const raw = fs.readFileSync(filePath, "utf8");
    const titleMatch = raw.match(/^title:\s*(.+)$/m);
    const dateMatch = raw.match(/^date:\s*"([^"]+)"$/m);
    const tokenMatch = raw.match(/^feishu_token:\s*"([^"]+)"$/m);
    const title = titleMatch ? JSON.parse(titleMatch[1]) : fileName.replace(/\.md$/, "");
    const dateStr = dateMatch ? dateMatch[1] : "2024-01-01";
    const docToken = tokenMatch ? tokenMatch[1] : "";
    const bodyWithoutFm = raw.replace(/^---[\s\S]*?---\n*/, "");
    const markdown = bodyWithoutFm.replace(/^#\s+.+\n+/, "");

    const { category, tags } = inferCategoryAndTags(title, markdown);
    const plainSummary = markdown
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[#>*`~\-\[\]()!|]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 110);

    const updatedContent = [
      "---",
      `title: ${JSON.stringify(title)}`,
      `date: "${dateStr}"`,
      `category: "${category}"`,
      `tags: ${JSON.stringify(tags)}`,
      `description: ${JSON.stringify(plainSummary)}`,
      `feishu_token: "${docToken}"`,
      "---",
      "",
      `# ${title}`,
      "",
      markdown,
      "",
    ].join("\n");
    fs.writeFileSync(filePath, updatedContent, "utf8");

    const dupCheck = compareWithExisting(title, markdown, existingIndex);
    manifest.push({
      fileName,
      title,
      date: dateStr,
      category,
      tags,
      docToken,
      status: dupCheck.status,
      bestMatch: dupCheck.bestMatch,
    });
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), "utf8");
  writeReviewMarkdown(manifest);
  console.log(`✅ 已重新完成 ${manifest.length} 篇暂存文档的分类校正与精确查重！`);
}

function runImport() {
  if (!fs.existsSync(REVIEW_FILE)) {
    throw new Error(`未找到审核清单 ${REVIEW_FILE}，请先执行 npm run feishu:pull`);
  }
  const reviewContent = fs.readFileSync(REVIEW_FILE, "utf8");
  const checkedFiles = [];
  const regex = /^- \[[xX]\] \*\*.*?\*\* \(`([^`]+\.md)`\)/gm;
  let match;
  while ((match = regex.exec(reviewContent)) !== null) {
    checkedFiles.push(match[1]);
  }

  if (checkedFiles.length === 0) {
    console.log("ℹ️ 审核清单中没有勾选 (`- [x]`) 任何文章，未导入任何文件。");
    return;
  }

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  const checkedSlugs = new Set(checkedFiles.map((f) => f.replace(/\.md$/, "")));
  let importedCount = 0;
  for (const fileName of checkedFiles) {
    const src = path.join(STAGING_POSTS_DIR, fileName);
    const dest = path.join(POSTS_DIR, fileName);
    if (!fs.existsSync(src)) {
      console.warn(`⚠️ 找不到暂存文件: ${src}`);
      continue;
    }
    fs.copyFileSync(src, dest);
    importedCount++;
    console.log(`✅ 已导入到 content/posts/${fileName}`);
  }

  // 清理未导入文章对应的图片目录，避免无用图片进入仓库
  if (fs.existsSync(IMAGES_DIR)) {
    for (const entry of fs.readdirSync(IMAGES_DIR, { withFileTypes: true })) {
      if (entry.isDirectory() && !checkedSlugs.has(entry.name)) {
        fs.rmSync(path.join(IMAGES_DIR, entry.name), { recursive: true, force: true });
      }
    }
  }

  console.log(`\n🎉 成功导入 ${importedCount} 篇飞书文章到 content/posts/！`);
  console.log(`👉 你可以先在 http://localhost:2027 本地预览，确认无误后执行 git add / commit / push 发布上线。`);
}

const action = process.argv[2] || "pull";
if (action === "pull") {
  runPull().catch((err) => {
    console.error("❌ 执行失败:", err.message);
    process.exit(1);
  });
} else if (action === "recheck") {
  runRecheck();
} else if (action === "import") {
  try {
    runImport();
  } catch (err) {
    console.error("❌ 导入失败:", err.message);
    process.exit(1);
  }
} else {
  console.log("用法: node scripts/feishu-sync.mjs [pull|recheck|import]");
}
