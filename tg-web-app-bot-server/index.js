const TelegramBot = require('node-telegram-bot-api');
require("dotenv").config()
const express = require('express');
const app = express()
const cors = require('cors');

const webAppUrl = 'https://728fcdc81543.ngrok-free.app/products'
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

// Middleware
app.use(cors({ origin: ['http://localhost:3000', webAppUrl], credentials: true }));
app.use(express.json());

// Обработчик WebApp данных
app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: `Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        console.error('WebApp error:', e);
        return res.status(500).json({})
    }
})

// Обработчик сообщений бота
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, войдите в систему', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Войти в систему", web_app: {url: webAppUrl}}]
                ]
                // Убрал resize_keyboard для inline-клавиатуры
            }
        });
    }
});

// Запуск сервера (ОДИН РАЗ!)
const PORT = process.env.PORT || 8500;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`WebApp URL: ${webAppUrl}`);
});