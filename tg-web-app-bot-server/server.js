require("dotenv").config();

const router = require("./routes/index.js");
const express = require("express");
const cors = require('cors');
const models = require("./models/models");
const sequelize = require('./database');
const path = require("path");
const app = express();
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const { initBot } = require("./bot");
const errorHandler = require("./middleware/ErrorHandlingMiddleware");
const { connectRedis, checkRedisConnection, client } = require("./redisClient");
const PORT = process.env.PORT || 5000;
const bot = initBot();
const { userSessions } = require('./sessionStore');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000', process.env.WEB_APP_URL],
    credentials: true
}));
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, "static")));
app.use(fileUpload({}));

app.use('/api', router);

app.post('/web-data', async (req, res) => {
    const { queryId, products = [], totalPrice, chatId } = req.body;

    try {
        const userSession = userSessions[chatId];
        let userAddress = userSession?.userData?.adress || 'Адрес не указан';

        let order = null;
        let userId = null;

        if (userSession?.userData?.userId) {
            userId = userSession.userData.userId;
        }

        try {
            const orderResponse = await fetch(`http://localhost:8000/api/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: products.map(item => ({
                        productId: item.id,
                        quantity: item.quantity || 1,
                        price: item.price
                    })),
                    totalAmount: totalPrice,
                    shippingAddress: userAddress,
                    userId: userId
                })
            });

            if (orderResponse.ok) {
                order = await orderResponse.json();
                console.log('Заказ сохранен в БД:', order);
            }
        } catch (dbError) {
            console.error('Ошибка сохранения заказа в БД:', dbError);
        }

        const inlineKeyboard = {
            inline_keyboard: [
                [
                    {
                        text: '✅ Подтвердить заказ',
                        callback_data: `confirm_order_${queryId}_${order?.id || 'no_db'}`
                    }
                ],
                [
                    {
                        text: '✏️ Изменить адрес',
                        callback_data: `change_address_${chatId}`
                    }
                ]
            ]
        };

        const productsText = products.map(item =>
            `• ${item.name} - ${item.quantity || 1} шт. × ${item.price} ₽ = ${(item.quantity || 1) * item.price} ₽`
        ).join('\n');

        await bot.sendMessage(chatId,
            `🛒 *Подтверждение заказа*\n\n` +
            `📍 *Адрес доставки:* ${userAddress}\n` +
            `💰 *Общая сумма:* ${totalPrice} ₽\n` +
            `📦 *Товары:*\n${productsText}\n\n` +
            `Подтвердите заказ или измените адрес доставки:`,
            {
                parse_mode: 'Markdown',
                reply_markup: inlineKeyboard
            }
        );

        return res.status(200).json({
            status: 'confirmation_sent',
            message: 'Заказ отправлен на подтверждение',
            orderId: order?.id
        });

    } catch (e) {
        console.error('WebApp error:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.use(errorHandler);

const start = async () => {
    try {
        await connectRedis();

        await checkRedisConnection();

        await sequelize.authenticate();
        await sequelize.sync();

        app.listen(PORT, () => {
            console.log("Server started on port " + PORT);
            console.log("WebApp URL: " + process.env.WEB_APP_URL);
            console.log("Redis connected: " + (client.isReady ? 'yes' : 'no'));
        });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

start();