const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

// webhook endpoint
app.post("/sink", (req, res) => {
  const log = `[${new Date().toISOString()}] Webhook received:\n${JSON.stringify(req.body, null, 2)}\n\n`;

  console.log(log); // console पर दिखेगा
  fs.appendFileSync("webhook_logs.txt", log); // फाइल में भी save होगा

  res.status(200).send("✅ Webhook received");
});

// app.post("/sink", (req, res) => {
//   console.log("📩 Received webhook:", req.body);
//   res.status(200).send("ok");
// });


app.listen(4000, () => {
  console.log("🚀 Webhook sink running at http://localhost:4000/sink");
});
