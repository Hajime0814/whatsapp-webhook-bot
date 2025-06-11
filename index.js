const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Webhook verify token（Metaに入れるものと一致させる）
const VERIFY_TOKEN = 'mysecrettoken123'; // ★ここは好きな文字列OK → Metaに同じものを入れる

app.use(bodyParser.json());

// Webhook verification (GET)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Webhook receive message (POST)
app.post('/webhook', (req, res) => {
    console.log('Received message:', JSON.stringify(req.body, null, 2));

    // 必要に応じてここでAI呼び出し → 返信処理を書く（次のステップ）
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
