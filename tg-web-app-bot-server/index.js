const TelegramBot = require('node-telegram-bot-api');
require("dotenv").config()
const express = require('express');
const app = express()
const cors = require('cors');
const webAppUrl = 'https://12fb37e03f41.ngrok-free.app'
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

app.use(express.json());
app.use(cors());
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, войдите в систему', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Войти в систему" ,web_app: {url: webAppUrl}}]
                ],
                resize_keyboard: true
            }
        });
    }
});
