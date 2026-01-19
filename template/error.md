文档里同样**没有给出 error webhook 的完整字段列表**，但提供了一份较完整的示例 payload。下面只整理文档中明确出现的字段，超出部分无法保证。

---

## 1. 顶层结构（error webhook 通用）

Error webhook 的整体结构：[[Errors 概览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/errors/)]

```json
{
  "action": "created",
  "actor": {
    "id": "sentry",
    "name": "Sentry",
    "type": "application"
  },
  "data": {
    "error": { ... }   // 见下文
  },
  "installation": {
    "uuid": "a8e5d37a-696c-4c54-adb5-b3f28d64c7de"
  }
}
```

- `action`: 目前只有 `created`。[[Errors 概览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/errors/)]
- `data.error`: 单个 error event 的详细信息。
- `installation.uuid`: 安装实例 UUID。
- `actor`: 触发者（这里是 Sentry 应用本身）。

---

## 2. `data.error` 中文档明确列出的字段

### 2.1 文档单独说明的字段

Error webhook 文档对部分字段有单独说明：[[Errors 概览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/errors/)]

- `data['error']`: object，创建的 error。
- `data['error']['url']`: error 的 API URL。
- `data['error']['web_url']`: error 的 Web URL。
- `data['error']['issue_url']`: 关联 issue 的 API URL。
- `data['event']['issue_id']`（注意这里文档有一处笔误，实际 payload 中是 `data['error']['issue_id']`，见下方示例）。

---

### 2.2 官方 payload 示例中的完整字段

文档中的示例 payload（节选）如下：[[Errors payload](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/errors/#payload)]

```json
"data": {
  "error": {
    "_ref": 1293919,
    "_ref_version": 2,
    "contexts": {
      "browser": {
        "name": "Chrome",
        "type": "browser",
        "version": "75.0.3770"
      },
      "os": {
        "name": "Mac OS X",
        "type": "os",
        "version": "10.14.0"
      }
    },
    "culprit": "?(runner)",
    "datetime": "2019-08-19T20:58:37.391000Z",
    "dist": null,
    "event_id": "bb78c1407cea4519aa397afc059c793d",
    "exception": {
      "values": [
        {
          "mechanism": {
            "data": {
              "message": "blooopy is not defined",
              "mode": "stack",
              "name": "ReferenceError"
            },
            "description": null,
            "handled": false,
            "help_link": null,
            "meta": null,
            "synthetic": null,
            "type": "onerror"
          },
          "stacktrace": {
            "frames": [
              {
                "abs_path": "https://null.jsbin.com/runner",
                "colno": 5,
                "context_line": "<meta charset=utf-8>",
                "data": {
                  "orig_in_app": 1
                },
                "errors": null,
                "filename": "/runner",
                "function": null,
                "image_addr": null,
                "in_app": false,
                "instruction_addr": null,
                "lineno": 3,
                "module": "runner",
                "package": null,
                "platform": null,
                "post_context": [
                  "<title>JS Bin Runner</title>",
                  "",
                  "<style type=\"text/css\">",
                  "  body {",
                  "    margin: 0;"
                ],
                "pre_context": [
                  "<!doctype html>",
                  "<html>"
                ],
                "raw_function": null,
                "symbol": null,
                "symbol_addr": null,
                "trust": null,
                "vars": null
              }
            ]
          },
          "type": "ReferenceError",
          "value": "blooopy is not defined"
        }
      ]
    },
    "fingerprint": ["{{ default }}"],
    "grouping_config": {
      "enhancements": "eJybzDhxY05qemJypZWRgaGlroGxrqHRBABbEwcC",
      "id": "legacy:2019-03-12"
    },
    "hashes": ["07d2da329989f6cd310eb5f1c5e828a4"],
    "issue_url": "https://sentry.io/api/0/issues/1170820242/",
    "issue_id": "1170820242",
    "key_id": "667532",
    "level": "error",
    "location": "/runner",
    "logger": "",
    "message": "",
    "metadata": {
      "filename": "/runner",
      "type": "ReferenceError",
      "value": "blooopy is not defined"
    },
    "platform": "javascript",
    "project": 1,
    "received": 1566248317.391,
    "release": null,
    "request": {
      "cookies": null,
      "data": null,
      "env": null,
      "fragment": null,
      "headers": [
        [
          "User-Agent",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36"
        ]
      ],
      "inferred_content_type": null,
      "method": null,
      "query_string": [],
      "url": "https://null.jsbin.com/runner"
    },
    "sdk": {
      "integrations": [
        "InboundFilters",
        "FunctionToString",
        "BrowserApiErrors",
        "Breadcrumbs",
        "GlobalHandlers",
        "LinkedErrors",
        "HttpContext"
      ],
      "name": "sentry.javascript.browser",
      "packages": [
        {
          "name": "npm:@sentry/browser",
          "version": "5.5.0"
        }
      ],
      "version": "5.5.0"
    },
    "tags": [
      ["browser", "Chrome 75.0.3770"],
      ["browser.name", "Chrome"],
      ["handled", "no"],
      ["level", "error"],
      ["mechanism", "onerror"],
      ["os", "Mac OS X 10.14.0"],
      ["os.name", "Mac OS X"],
      ["user", "ip:162.217.75.90"],
      ["url", "https://null.jsbin.com/runner"]
    ],
    "time_spent": null,
    "timestamp": 1566248317.391,
    "title": "ReferenceError: blooopy is not defined",
    "type": "error",
    "url": "https://sentry.io/api/0/projects/test-org/front-end/events/bb78c1407cea4519aa397afc059c793d/",
    "user": {
      "ip_address": "162.218.85.90"
    },
    "version": "7",
    "web_url": "https://sentry.io/organizations/test-org/issues/1170820242/events/bb78c1407cea4519aa397afc059c793d/"
  }
}
```

从这个示例可以整理出 `data.error` 中出现的字段（按类别分组）：

#### 标识与链接

- `_ref`
- `_ref_version`
- `event_id`
- `issue_url`
- `issue_id`
- `key_id`
- `url`（event API URL）
- `web_url`（event Web URL）

#### 上下文与环境

- `contexts`（对象）
  - `contexts.browser.name`
  - `contexts.browser.type`
  - `contexts.browser.version`
  - `contexts.os.name`
  - `contexts.os.type`
  - `contexts.os.version`

#### 异常信息

- `exception.values[]`
  - `type`
  - `value`
  - `mechanism`
    - `mechanism.type`
    - `mechanism.handled`
    - `mechanism.description`
    - `mechanism.help_link`
    - `mechanism.meta`
    - `mechanism.synthetic`
    - `mechanism.data`
      - `message`
      - `mode`
      - `name`
  - `stacktrace.frames[]`
    - `abs_path`
    - `colno`
    - `context_line`
    - `data.orig_in_app`
    - `errors`
    - `filename`
    - `function`
    - `image_addr`
    - `in_app`
    - `instruction_addr`
    - `lineno`
    - `module`
    - `package`
    - `platform`
    - `post_context`（数组）
    - `pre_context`（数组）
    - `raw_function`
    - `symbol`
    - `symbol_addr`
    - `trust`
    - `vars`

#### 分组与指纹

- `fingerprint`（数组）
- `grouping_config`
  - `grouping_config.enhancements`
  - `grouping_config.id`
- `hashes`（数组）

#### 级别与元数据

- `level`（如 `"error"`）
- `location`
- `logger`
- `message`
- `metadata`
  - `metadata.filename`
  - `metadata.type`
  - `metadata.value`
- `platform`（如 `"javascript"`）
- `type`（如 `"error"`）
- `title`

#### 项目与版本

- `project`（项目 ID）
- `release`（可为 null）
- `version`（事件协议版本）

#### 时间相关

- `datetime`
- `received`
- `timestamp`
- `time_spent`

#### 请求信息

- `request`
  - `request.cookies`
  - `request.data`
  - `request.env`
  - `request.fragment`
  - `request.headers`（二维数组）
  - `request.inferred_content_type`
  - `request.method`
  - `request.query_string`
  - `request.url`

#### SDK 信息

- `sdk`
  - `sdk.name`
  - `sdk.version`
  - `sdk.integrations[]`
  - `sdk.packages[]`
    - `packages[].name`
    - `packages[].version`

#### 标签与用户

- `tags`（二维数组，如 `["browser", "Chrome 75.0.3770"]` 等）
- `user`
  - `user.ip_address`

---

## 3. 总结

- Error webhook 的 `data.error` 本质上就是一条完整的 **error event**，包含 Sentry 事件模型中的大部分字段。[[Errors payload](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/errors/#payload)]
- 上面列出的字段全部来自官方示例和字段说明；文档没有声明这是“完整且固定的 schema”，因此未来可能会有新增字段，或者在不同平台/SDK 下出现略有差异。
- 在实现解析时，建议：
  - 按上述字段做主解析；
  - 对 `data.error` 采用“宽松解析”（允许额外字段），以保持兼容性。