require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');

let bot = null;

function initBot() {
    if (!bot) {
        bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
        const userSessions = {};

        async function updateKeyboard(chatId, userRole = null) {
            let keyboard = [];

            if (userRole) {
                switch(userRole) {
                    case 'admin':
                        keyboard = [
                            [{text: '⚙️ Панель управления', web_app: {url: `${process.env.WEB_APP_URL}/admin`}}],
                            [{text: '📊 Статистика', web_app: {url: `${process.env.WEB_APP_URL}/stats`}}],
                            [{text: '🚪 Выйти из системы'}]
                        ];
                        break;
                }
            } else {
                keyboard = [
                    [{text: '📞 Контакты'}, {text: 'ℹ️ О нас'}],
                    [{text: '🚀 Войти в систему', web_app: {url: process.env.WEB_APP_URL + '/form'}}]
                ];
            }

            try {
                await bot.sendMessage(chatId, 'Используйте кнопки ниже:', {
                    reply_markup: {
                        keyboard: keyboard,
                        resize_keyboard: true,
                        one_time_keyboard: false
                    }
                });
            } catch (error) {
                console.error('Ошибка при обновлении клавиатуры:', error);
            }
        }

        async function showMainMenu(chatId, userRole) {
            console.log('showMainMenu called with:', { chatId, userRole });

            let menuText = '*Главное меню*\n\n';

            switch(userRole) {
                case 'admin':
                    menuText += '*Вы администратор*\nИспользуйте кнопки ниже для управления системой';
                    break;
            }

            try {
                await bot.sendMessage(chatId, menuText, {
                    parse_mode: 'Markdown'
                });
                console.log('Информация о меню отправлена пользователю:', chatId);
            } catch (error) {
                console.error('Ошибка при отправке информации о меню:', error);
            }
        }

        bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            console.log('Получено сообщение:', { chatId, text });

            if (!userSessions[chatId] && text) {
                switch(text) {
                    case '📞 Контакты':
                        await bot.sendMessage(chatId, '📱 *Наши контакты:*\n\n• Телефон: +7 (999) 123-45-67\n• Email: info@example.com\n• Адрес: ул. Примерная, д. 123', );
                        break;
                    case 'ℹ️ О нас':
                        await bot.sendMessage(chatId, '🏢 *О нашей компании:*\n\nМы лучший магазин в городе! Качественные товары, быстрая доставка и отличный сервис.', );
                        break;
                    case '🚀 Войти в систему':

                        await bot.sendMessage(chatId, 'Открываю форму для входа...');
                        break;
                }
            }

            if (userSessions[chatId] && userSessions[chatId].isAuthenticated && text === '🚪 Выйти из системы') {
                delete userSessions[chatId];
                await bot.sendMessage(chatId, ' *Вы успешно вышли из системы!*', { parse_mode: 'Markdown' });
                await updateKeyboard(chatId);
                return;
            }

            if(text === '/start') {
                if (userSessions[chatId] && userSessions[chatId].isAuthenticated) {

                    const userData = userSessions[chatId].userData;
                    await updateKeyboard(chatId, userData.role);
                    await showMainMenu(chatId, userData.role);
                } else {
                    await updateKeyboard(chatId);
                }
            }


            if (msg?.web_app_data?.data) {
                try {
                    const data = JSON.parse(msg.web_app_data.data);
                    console.log('Данные из веб-приложения:', data);


                    userSessions[chatId] = {
                        isAuthenticated: true,
                        userData: data,
                        timestamp: Date.now()
                    };
                    console.log(userSessions)
                    console.log('Текущие сессии:', Object.keys(userSessions));

                    await bot.sendMessage(chatId, '*Авторизация успешна!*',);
                    await bot.sendMessage(chatId,
                        `*Username:* ${data.username}\n` +
                        `*Role:* ${data.role}` +
                        `${data.email ? `\n*Email:* ${data.email}` : ''}`,

                    );


                    await updateKeyboard(chatId, data.role);

                    await showMainMenu(chatId, data.role);

                } catch (e) {
                    console.error('Ошибка обработки данных:', e);
                    console.error('Raw data:', msg.web_app_data.data);
                    await bot.sendMessage(chatId, 'Ошибка при обработке данных авторизации');
                }
            }

            if (userSessions[chatId] && userSessions[chatId].isAuthenticated) {
                if (text === '/menu') {
                    const userData = userSessions[chatId].userData;
                    await showMainMenu(chatId, userData.role);
                }
                if (text === '/sessions') {
                    const sessionCount = Object.keys(userSessions).length;
                    await bot.sendMessage(chatId, `Активные сессии: ${sessionCount}`);
                }
                if (text === '/debug') {
                    await bot.sendMessage(chatId, `Сессия: ${JSON.stringify(userSessions[chatId], null, 2)}`);
                }
                if (text === '/logout') {
                    delete userSessions[chatId];
                    await bot.sendMessage(chatId, 'Вы вышли из системы');
                    await updateKeyboard(chatId);
                }
            }
        });

        bot.on('polling_error', (error) => {
            console.error('Polling error:', error);
        });

        console.log('Telegram bot initialized successfully');
        console.log('WEB_APP_URL:', process.env.WEB_APP_URL);
    }
    return bot;
}

module.exports = { initBot };