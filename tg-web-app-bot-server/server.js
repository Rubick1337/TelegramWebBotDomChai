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
const PORT = process.env.PORT || 5000;
const Bot = initBot();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000', "https://4bff700d6634.ngrok-free.app"],
    credentials: true
}));
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, "static")));
app.use(fileUpload({}));

app.use('/api', router);

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
        });
        return res.status(200).json({});
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
    try{
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => {
            console.log("Server started on port " + PORT);
            console.log("WebApp URL: " + process.env.WEB_APP_URL);
        });
    } catch (err) {
        console.log(err);
    }
}

start();