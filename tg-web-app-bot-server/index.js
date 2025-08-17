const TelegramBot = require('node-telegram-bot-api');
require("dotenv").config()
const express = require('express');
const app = express()
const cors = require('cors');

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

app.use(express.json());
app.use(cors());
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    bot.sendMessage(chatId, text);
})
