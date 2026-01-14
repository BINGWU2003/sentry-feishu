const express = require("express");
const axios = require("axios");
const app = express();
// 假设你的 config.js 是读取 process.env 的
const { config } = require("./config");

app.use(express.json());

// 简单的日期格式化函数
function formatDate(isoString) {
  if (!isoString) return new Date().toLocaleString();
  return new Date(isoString).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });
}

app.post("/sentry", async (req, res) => {
  const { body } = req;
  console.log("⬇️ Sentry Payload:", JSON.stringify(body));

  // ==========================================
  // 核心逻辑：判断数据结构并提取信息
  // ==========================================
  let project, title, message, url, level, env, time, shortId;

  // 场景 A: 你的最新截图 (Issue Created 事件)
  if (body.data && body.data.issue) {
    const issue = body.data.issue;

    // 尝试从 project 对象里拿名字，如果拿不到就用 shortId 的前缀
    project = issue.project
      ? issue.project.slug || issue.project.name
      : "Sentry Project";
    title = issue.title; // ReferenceError: ...
    message = issue.culprit || "未知位置"; // 登录页
    url = issue.web_url; // https://hjc.sentry.io/...
    level = issue.level || "error";
    shortId = issue.shortId; // MES_WEB-B
    time = formatDate(issue.firstSeen);
    env = "production"; // 这个 payload 里 metadata 是 object，暂时硬编码，或者从 tags 提取
  }
  // 场景 B: 之前的 Alert Rule (报警规则通知)
  else {
    project = body.project_name || "My Project";
    title = body.event?.title || "Unknown Error";
    message = body.event?.culprit || body.message;
    url = body.url;
    level = body.level || "error";
    shortId = "ALERT";
    time = formatDate(new Date().toISOString());
    env = body.event?.environment || "production";
  }

  // ==========================================
  // 组装飞书卡片 (优化版)
  // ==========================================

  // 根据错误级别决定卡片颜色
  const colorTemplate =
    level === "fatal" || level === "error" ? "red" : "orange";

  const cardContent = {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true },
      header: {
        title: {
          tag: "plain_text",
          content: `🚨 Sentry 报警 [${shortId}]`, // 标题带上编号，显得很专业
        },
        template: colorTemplate,
      },
      elements: [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: [
              `**项目名称:** ${project}`,
              `**错误摘要:** ${title}`,
              `**报错位置:** ${message}`,
              `**发生时间:** ${time}`,
              `**当前状态:** ${body.action || "Triggered"}`, // 显示 created 或 unresolved
            ].join("\n"),
          },
        },
        {
          tag: "hr", // 分割线
        },
        {
          tag: "action",
          actions: [
            {
              tag: "button",
              text: { tag: "plain_text", content: "🐞 查看问题详情" },
              url: url,
              type: "primary",
            },
            {
              tag: "button",
              text: { tag: "plain_text", content: "📂 打开项目面板" },
              // 这里用 project_url，如果 payload 里没有，就回退到 url
              url: body.data?.issue?.project_url || url,
              type: "default",
            },
          ],
        },
      ],
    },
  };

  // 发送请求
  try {
    await axios.post(config.FEISHU_WEBHOOK, cardContent);
    console.log("✅ Sent to Feishu Success");
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Feishu Error:", error.response?.data || error.message);
    res.status(500).send("Error");
  }
});

module.exports = app;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
