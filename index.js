const express = require("express");
const axios = require("axios");
const app = express();
const { config } = require("./config");

app.use(express.json());

function formatDate(isoString) {
  if (!isoString) return new Date().toLocaleString();
  return new Date(isoString).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });
}

app.post("/sentry", async (req, res) => {
  const { body } = req;
  // 建议保留日志，方便后续查看 metadata 结构
  console.log("⬇️ Sentry Payload:", JSON.stringify(body));

  let project, title, message, url, level, env, time, shortId;
  let errorLocation = ""; // 新增：用于存放具体的代码位置

  // 场景 A: Issue Created 事件 (你提供的截图格式)
  if (body.data && body.data.issue) {
    const issue = body.data.issue;

    project = issue.project
      ? issue.project.slug || issue.project.name
      : "Sentry Project";
    title = issue.title;
    url = issue.web_url;
    level = issue.level || "error";
    shortId = issue.shortId;
    time = formatDate(issue.firstSeen);

    // 💡 核心优化：尝试从 metadata 提取“文件名”和“函数名”
    // Sentry 的 metadata 结构对于 JS 报错通常包含 filename
    const meta = issue.metadata || {};
    if (meta.filename) {
      // 如果有文件名，拼装成：at login.vue (line 20)
      errorLocation = `\n**代码位置:** ${meta.filename}`;
      if (meta.function) {
        errorLocation += ` \`func: ${meta.function}\``;
      }
    } else {
      // 降级方案：使用 culprit
      message = issue.culprit;
    }
  }
  // 场景 B: Alert Rule 事件
  else {
    project = body.project_name || "My Project";
    title = body.event?.title || "Unknown Error";
    message = body.event?.culprit || body.message;
    url = body.url;
    level = body.level || "error";
    shortId = "ALERT";
    time = formatDate(new Date().toISOString());
  }

  // 颜色逻辑
  const colorTemplate =
    level === "fatal" || level === "error" ? "red" : "orange";

  // 组装最终展示的文本
  // 如果解析出了 errorLocation，就优先展示它，否则展示 message (culprit)
  const locationText = errorLocation
    ? errorLocation
    : `\n**报错位置:** ${message}`;

  const cardContent = {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true },
      header: {
        title: {
          tag: "plain_text",
          content: `🚨 Sentry 报警 [${shortId}]`,
        },
        template: colorTemplate,
      },
      elements: [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: [
              `**项目:** ${project}`,
              `**错误:** ${title}`,
              locationText, // 这里直接显示具体的文件名
              `**时间:** ${time}`,
            ].join("\n"),
          },
        },
        {
          tag: "hr",
        },
        {
          tag: "action",
          actions: [
            {
              tag: "button",
              text: { tag: "plain_text", content: "🐞 查看详情 (需登录)" },
              url: url,
              type: "primary",
            },
          ],
        },
      ],
    },
  };

  try {
    await axios.post(config.FEISHU_WEBHOOK, cardContent);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Feishu Error", error);
    res.status(500).send("Error");
  }
});

module.exports = app;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
