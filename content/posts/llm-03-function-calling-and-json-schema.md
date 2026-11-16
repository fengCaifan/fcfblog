---
title: "大模型 Function Calling 完整调用流程与工具执行边界"
date: '2026-10-11'
category: "AI 与大模型"
description: "通过两次 HTTP 请求手动复现模型发起函数调用、本地执行工具并带回 call_id 生成最终回复的过程。"
tags: ["Function Calling", "AI Agent", "JSON Schema"]
---

## 本节目标

不改 `AgentWorkspaceDemo` 代码，先用两次 HTTP 请求亲眼观察：

```text
请求 1：模型收到工具契约与用户问题 → 返回 function_call
请求 2：程序把工具执行结果与 call_id 回传 → 模型给出最终中文回答
```

完成后再回看 `agent/answerer.js`，你会知道其中每个对象为什么存在。

---

## 0. 本节的安全约束

- 不在命令、笔记、终端截图或 Git 中写入 API Key。
- 使用已有的 `scripts/load-agent-workspace-demo-gateway-env.js` 从本机配置加载环境变量。
- 本节使用一个**本地模拟工具** `get_project_info`，不读取真实内部代码、不执行 Shell、不调用 Git。
- 真实项目中的 `search_code` / `read_file` 以后再学；它们额外需要路径授权、超时、文件大小和输出限制。

---

## 1. 先建立术语（只要记住这四个）

| 名称 | 谁产生 | 内容 |
| --- | --- | --- |
| Tool definition | 应用 | 工具名、用途与参数 JSON Schema。 |
| Function call | 模型 | “请应用调用这个工具”，附带 `name`、`arguments`、`call_id`。 |
| Function call output | 应用 | 工具执行结果，必须带原来的 `call_id`。 |
| Final answer | 模型 | 根据工具结果给用户的正常回答。 |

> **关键边界**：模型只能提出 Function Call；真正执行任何代码、搜索、文件读取或写入的都是你的服务端程序。

---

## 2. 准备环境变量（不显示密钥）

在学习目录执行：

```bash
source <(node scripts/load-agent-workspace-demo-gateway-env.js)
```

这个脚本只在运行时读取 `AgentWorkspaceDemo/.env` 或 `~/.codex/config.toml`，然后把配置导出到**当前终端进程**。它并不会往学习目录写入密钥。请先阅读它的源码再运行。

确认变量是否存在时，只检查长度，绝不打印值：

```bash
[ -n "$OPENAI_API_KEY" ] && echo "API Key 已加载（值已隐藏）" || echo "API Key 未加载"
printf 'base URL: %s\nmodel: %s\n' "$OPENAI_BASE_URL" "$OPENAI_MODEL"
```

预期：显示 base URL、model 和 “API Key 已加载（值已隐藏）”。

---

## 3. 第一次请求：让模型提出调用请求

创建一个临时请求体。它声明了一个只有 `topic` 参数的本地模拟工具：

```bash
cat > /private/tmp/agent-tool-step-1.json <<'JSON'
{
  "model": "REPLACE_MODEL",
  "instructions": "你是 Agent 开发导师。遇到项目基本信息问题时，必须调用 get_project_info；不要直接回答。",
  "input": "AgentWorkspaceDemo 是什么项目？",
  "tools": [
    {
      "type": "function",
      "name": "get_project_info",
      "description": "读取本地项目简介。仅用于回答 AgentWorkspaceDemo 的基本定位。",
      "parameters": {
        "type": "object",
        "properties": {
          "topic": {
            "type": "string",
            "description": "要查询的信息主题，例如 overview"
          }
        },
        "required": ["topic"],
        "additionalProperties": false
      },
      "strict": true
    }
  ],
  "tool_choice": "required"
}
JSON
sed -i '' "s/REPLACE_MODEL/$OPENAI_MODEL/" /private/tmp/agent-tool-step-1.json
```

发送它，并把响应保存到临时文件：

```bash
curl -sS --fail-with-body "$OPENAI_BASE_URL/responses" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --data-binary @/private/tmp/agent-tool-step-1.json \
  > /private/tmp/agent-tool-step-1-response.json
```

先不要急着读全部 JSON。只提取 `function_call` 项（macOS 自带 Python）：

```bash
python3 - <<'PY'
import json
response = json.load(open('/private/tmp/agent-tool-step-1-response.json'))
calls = [item for item in response.get('output', []) if item.get('type') == 'function_call']
print(json.dumps(calls, ensure_ascii=False, indent=2))
PY
```

### 你应该观察到什么

输出中应有一个对象，重点是：

```json
{
  "type": "function_call",
  "name": "get_project_info",
  "arguments": "{...}",
  "call_id": "call_..."
}
```

- `arguments` 往往是**JSON 字符串**，不是已经解析好的 JavaScript 对象；所以服务端必须 `JSON.parse()`，且要捕获失败。
- `call_id` 是本次调用的关联 ID。下一步必须原样带回。
- 即便这里用了 `strict: true`，也仍然要在服务端做授权和业务校验；它不能替代安全边界。

如果网关返回 “unknown parameter: strict” 或不支持该工具格式，记录完整错误（隐藏 Authorization），不要猜；这正是“兼容 Responses API”与官方 API 行为可能不同的一个验证点。

---

## 4. 模拟应用执行工具，生成第二次请求

现实中 Node.js 服务会根据 `name` 选择白名单函数、验证参数，然后执行它。这里我们手动提供一段确定的工具结果，等同于模拟：

```js
get_project_info({ topic: "overview" })
```

运行下列命令。它读取第一次模型输出，保留模型的 `output`，再追加一个携带**同一 `call_id`** 的 `function_call_output`：

```bash
python3 - <<'PY'
import json, os
step1 = json.load(open('/private/tmp/agent-tool-step-1-response.json'))
calls = [item for item in step1.get('output', []) if item.get('type') == 'function_call']
if len(calls) != 1:
    raise SystemExit(f'期望正好一个 function_call，实际为 {len(calls)}；请先保存响应并检查。')
call = calls[0]
tool_result = {
    'name': 'AgentWorkspaceDemo',
    'purpose': '供团队成员查询 ios-app 代码逻辑的内部问答助手',
    'flow': 'Express 接口 → Agent → 代码检索工具 → 证据化回答'
}
body = {
    'model': os.environ['OPENAI_MODEL'],
    'instructions': '你是 Agent 开发导师。只能根据工具结果，用中文简洁回答用户。',
    'input': [
        {'role': 'user', 'content': 'AgentWorkspaceDemo 是什么项目？'},
        *step1['output'],
        {
            'type': 'function_call_output',
            'call_id': call['call_id'],
            'output': json.dumps(tool_result, ensure_ascii=False)
        }
    ],
    'tools': [
        {
            'type': 'function',
            'name': 'get_project_info',
            'description': '读取本地项目简介。',
            'parameters': {
                'type': 'object',
                'properties': {'topic': {'type': 'string'}},
                'required': ['topic'],
                'additionalProperties': False
            },
            'strict': True
        }
    ]
}
json.dump(body, open('/private/tmp/agent-tool-step-2.json', 'w'), ensure_ascii=False)
print('已生成 /private/tmp/agent-tool-step-2.json；回传 call_id:', call['call_id'])
PY
```

发送第二次请求：

```bash
curl -sS --fail-with-body "$OPENAI_BASE_URL/responses" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --data-binary @/private/tmp/agent-tool-step-2.json \
  > /private/tmp/agent-tool-step-2-response.json
```

只读取最终文本：

```bash
python3 - <<'PY'
import json
response = json.load(open('/private/tmp/agent-tool-step-2-response.json'))
for item in response.get('output', []):
    for content in item.get('content', []):
        if content.get('type') in ('output_text', 'text'):
            print(content.get('text', ''))
PY
```

---

## 5. 将实验映射回 AgentWorkspaceDemo

实验中的手动过程，对应 `agent/answerer.js`：

| 这次 curl 实验 | 项目代码 |
| --- | --- |
| `tools` JSON | `const tools = [...]` |
| 模型的 `function_call` | `response.output.filter(item => item.type === 'function_call')` |
| 解析 `arguments` | `JSON.parse(call.arguments || '{}')` |
| 本地模拟工具结果 | `callTool()` → `searchCode()` / `readFile()` |
| 回传 `function_call_output` | `executeCalls()` 中的 `outputs.push(...)` |
| 第二次 `/responses` | `followUp(response.output, ...)` |

阅读时要回答：为什么 `read_file` 的 `file_path` 虽然是 Schema 中的 `string`，仍然必须经过 `resolveProjectPath()`？

---

## 6. 完成检查

完成后请把以下内容贴回（不要贴 API Key）：

1. 第一次响应中的 `name`、`arguments`、`call_id`（可将 ID 中间部分打码）。
2. 第二次请求的最终中文回答。
3. 你自己的回答：`call_id` 为什么不能省略或随便换一个？
4. 网关是否接受 `strict: true`；若失败，报错是什么？

## 本节结论

```text
JSON Schema：定义参数或最终输出的形状。
Function Calling：模型提出调用意图，不执行权限操作。
服务端：解析 → 校验 → 授权 → 执行 → 以原 call_id 回传结果。
Agent Loop：重复这一过程，直到模型能回答；必须设置轮次、时间和输出上限。
```
