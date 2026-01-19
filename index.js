const express = require("express");
const axios = require("axios");
const app = express();
const { config } = require("./config");
const { processError, processIssue, processUnknown } = require("./handlers");

app.use(express.json());

app.post("/sentry", async (req, res) => {
  const { body } = req;
  console.log("⬇️ ================= SENTRY BODY START ================= ⬇️");
  console.log(JSON.stringify(body, null, 2));
  console.log("⬆️ ================= SENTRY BODY END =================== ⬆️");

  let cardContent;

  try {
    // 场景 A: Error 事件 (data.error)
    if (body.data?.error) {
      console.log("📌 处理 Error 事件");
      cardContent = processError(body.data.error);
    }
    // 场景 B: Issue 事件 (data.issue)
    else if (body.data?.issue) {
      console.log("📌 处理 Issue 事件");
      cardContent = processIssue(body.data.issue);
    }
    // 场景 C: 其他未知格式
    else {
      console.log("⚠️ 未知的 webhook 格式");
      cardContent = processUnknown(body);
    }

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
