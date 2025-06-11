const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios"); // 追加

const app = express();
const port = process.env.PORT || 3000;

// Webhook verify token
const VERIFY_TOKEN = "mysecrettoken123";

app.use(bodyParser.json());

// Webhook verification (GET)
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Webhook receive message (POST)
app.post("/webhook", async (req, res) => {
    console.log("Received message:", JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages) {
        const phone_number_id = value.metadata.phone_number_id;
        const from = messages[0].from;
        const msg_body = messages[0].text.body;

        console.log("ユーザーからのメッセージ：", msg_body);

        // アクセストークン
        const token =
            "EAA1ZB9tBiqo0BOZCSTO8IsdJPU5xkXrTZAr7YyUqYpaDKGrY4e7g90lzLA9Iv2BjMpZCf0LJX8tUbDtfkQIcqFljsiyZCS5jBa9OXcPAgpLBIGFN2vuyCHc7qSXRVwmXVm6ftkHf8T7KITcRZBKsQwhDxjdTqkKwWxPid9FFz684GXhwJMnHilDxYTHRGR39PKdRZB2l3iVM3K7vNZC2t2hZCrqMX1d8lI1hENgZDZD";
        // 例:
        // const token = "EAAI...ZDZD";

        // 自動返信
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/v18.0/${phone_number_id}/messages`,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: { body: `Hello! You said: ${msg_body}` },
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Reply sent!");
        } catch (err) {
            console.error(
                "Error sending message:",
                err.response
                    ? {
                          status: err.response.status,
                          data: err.response.data,
                          headers: err.response.headers,
                      }
                    : err.message,
            );
        }
    }

    res.sendStatus(200);
});

// サーバー起動
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
