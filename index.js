const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// 飞书机器人的 Webhook 地址 (建议放到环境变量)
const FEISHU_WEBHOOK =
  "https://open.feishu.cn/open-apis/bot/v2/hook/c3f0537e-533a-4738-8113-3945aa1d5662";

app.post("/sentry", async (req, res) => {
  const { body } = req;

  // 1. 简单的过滤：只发 Error 级别的报错
  if (body.level !== "error" && body.level !== "fatal") {
    return res.send("Ignored");
  }

  // 2. 提取关键信息
  const project = body.project_name || "My Project";
  const title = body.event?.title || "Unknown Error";
  const message = body.event?.culprit || body.message;
  const url = body.url; // Sentry 详情链接

  // 3. 组装飞书卡片 (这是最能体现专业度的地方)
  const cardContent = {
    msg_type: "interactive",
    card: {
      header: {
        title: {
          tag: "plain_text",
          content: `🚨 Sentry 报警: ${project}`,
        },
        template: "red", // 红色标题，紧迫感拉满
      },
      elements: [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: `**错误标题:** ${title}\n**报错位置:** ${message}\n**环境:** ${
              body.event?.environment || "production"
            }`,
          },
        },
        {
          tag: "action",
          actions: [
            {
              tag: "button",
              text: { tag: "plain_text", content: "查看堆栈详情" },
              url: url,
              type: "primary",
            },
          ],
        },
      ],
    },
  };

  // 4. 发送到飞书
  try {
    await axios.post(FEISHU_WEBHOOK, cardContent);
    console.log("Sent to Feishu");
    res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
});

// Vercel 需要 export app
module.exports = app;

// 本地测试解开下面注释
// app.listen(3000, () => console.log("Server running on port 3000"));
