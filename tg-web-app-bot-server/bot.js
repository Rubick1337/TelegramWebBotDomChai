require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');

let bot = null;
const { userSessions } = require('./sessionStore');

function initBot() {
    if (!bot) {
        bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

        async function updateKeyboard(chatId, userRole = null) {
            let keyboard = [];

            console.log('updateKeyboard called with role:', userRole);

            const cleanRole = userRole ? userRole.trim().toLowerCase() : null;
            console.log('Cleaned role:', cleanRole);

            if (cleanRole) {
                switch(cleanRole) {
                    case 'admin':
                        console.log('Building keyboard for admin');
                        keyboard = [
                            [{text: '⚙️ Панель управления', web_app: {url: `${process.env.WEB_APP_URL}/admin`}}],
                            [{text: '📦 Все заказы', web_app: {url: `${process.env.WEB_APP_URL}/order`}}],
                            [{text: '📊 Статистика', web_app: {url: `${process.env.WEB_APP_URL}/stats`}}],
                            [{text: '🚪 Выйти из системы'}]
                        ];
                        break;
                    case 'user':
                        console.log('Building keyboard for user');
                        keyboard = [
                            [{text: '📋 Мои заказы', web_app: {url: `${process.env.WEB_APP_URL}/order`}}],
                            [{text: '🚪 Выйти из системы'}]
                        ];
                        break;
                    default:
                        console.log('Building keyboard for default role:', cleanRole);
                        keyboard = [
                            [{text: '🛒 Магазин', web_app: {url: `${process.env.WEB_APP_URL}/products`}}],
                            [{text: '🚪 Выйти из системы'}]
                        ];
                }
            } else {
                console.log('Building keyboard for unauthorized user');
                keyboard = [
                    [{text: '📞 Контакты'}, {text: 'ℹ️ О нас'}],
                    [{text: '🚀 Войти в систему', web_app: {url: `${process.env.WEB_APP_URL}/form`}}]
                ];
            }

            try {
                console.log('Sending keyboard:', keyboard);
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
            let menuText = '*Главное меню*\n\n';

            switch(userRole) {
                case 'admin':
                    menuText += '*Вы администратор*\nИспользуйте кнопки ниже для управления системой';
                    break;
                case 'user':
                    menuText += '*Добро пожаловать!*\nИспользуйте кнопки ниже для покупок и просмотра заказов';
                    break;
                default:
                    menuText += '*Добро пожаловать!*\nИспользуйте кнопки ниже для покупок';
            }

            try {
                await bot.sendMessage(chatId, menuText, {
                    parse_mode: 'Markdown'
                });
            } catch (error) {
                console.error('Ошибка при отправке информации о меню:', error);
            }
        }

        bot.on('callback_query', async (callbackQuery) => {
            const chatId = callbackQuery.message.chat.id;
            const data = callbackQuery.data;

            try {
                if (data.startsWith('confirm_order_')) {
                    const parts = data.split('_');
                    const queryId = parts[2];
                    const orderId = parts[3];
                    if (orderId && orderId !== 'no_db') {
                        try {
                            await fetch(`http://localhost:8000/api/order/${orderId}/status`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ status: 'processing' })
                            });
                        } catch (updateError) {
                            console.error('Ошибка обновления статуса заказа:', updateError);
                        }
                    }

                    const userSession = userSessions[chatId];
                    const userAddress = userSession?.userData?.adress || 'адрес не указан';

                    await bot.answerWebAppQuery(queryId, {
                        type: 'article',
                        id: queryId,
                        title: 'Заказ подтвержден',
                        input_message_content: {
                            message_text: `✅ Заказ подтвержден! Ожидайте доставки по адресу: ${userAddress}\n\n` +
                                `Номер заказа: ${orderId && orderId !== 'no_db' ? '#' + orderId : 'не сохранен в БД'}\n` +
                                `Статус: В обработке`
                        }
                    });

                    await bot.editMessageText('✅ *Заказ подтвержден!*\n\nОжидайте доставки.', {
                        chat_id: chatId,
                        message_id: callbackQuery.message.message_id,
                        parse_mode: 'Markdown'
                    });

                    if (userSession) {
                        userSession.currentOrder = null;
                    }

                } else if (data.startsWith('change_address_')) {
                    await bot.sendMessage(chatId,
                        '📍 *Введите новый адрес доставки:*\n\n' +
                        'Формат: Город, Улица, Дом, Квартира',
                        { parse_mode: 'Markdown' }
                    );

                    userSessions[chatId].awaitingAddress = true;
                }

                await bot.answerCallbackQuery(callbackQuery.id);

            } catch (error) {
                console.error('Callback error:', error);
                await bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка' });
            }
        });

        // Обработчик сообщений
        bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            console.log('Получено сообщение:', { chatId, text });

            // Обработка ввода адреса
            if (userSessions[chatId]?.awaitingAddress && text) {
                try {
                    if (!userSessions[chatId].userData) {
                        userSessions[chatId].userData = {};
                    }
                    userSessions[chatId].userData.address = text;
                    userSessions[chatId].awaitingAddress = false;

                    await bot.sendMessage(chatId,
                        `✅ *Адрес обновлен:*\n${text}\n\n` +
                        `Теперь вы можете оформить заказ с новым адресом.`,
                        { parse_mode: 'Markdown' }
                    );
                    return;
                } catch (error) {
                    console.error('Address update error:', error);
                    await bot.sendMessage(chatId, 'Произошла ошибка при обновлении адреса');
                    return;
                }
            }

            // Обработка обычных команд
            if (!userSessions[chatId] && text) {
                switch(text) {
                    case '📞 Контакты':
                        await bot.sendMessage(chatId, '📱 *Наши контакты:*\n\n• Телефон: +7 (999) 123-45-67\n• Email: info@example.com\n• Адрес: ул. Примерная, д. 123', { parse_mode: 'Markdown' });
                        break;
                    case 'ℹ️ О нас':
                        await bot.sendMessage(chatId, '🏢 *О нашей компании:*\n\nМы лучший магазин в городе! Качественные товары, быстрая доставка и отличный сервис.', { parse_mode: 'Markdown' });
                        break;
                    case '🚀 Войти в систему':
                        await bot.sendMessage(chatId, 'Открываю форму для входа...');
                        break;
                }
            }

            if (userSessions[chatId] && userSessions[chatId].isAuthenticated && text === '🚪 Выйти из системы') {
                delete userSessions[chatId];
                await bot.sendMessage(chatId, '*Вы успешно вышли из системы!*', { parse_mode: 'Markdown' });
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
                        timestamp: Date.now(),
                        awaitingAddress: false
                    };

                    await bot.sendMessage(chatId, '*Авторизация успешна!*',);
                    await bot.sendMessage(chatId,
                        `Username: ${data.username}\n` +
                        `Role: ${data.role}` +
                        `${data.email ? `\nEmail: ${data.email}` : ''}` +
                        `${data.adress ? `\nAddress: ${data.adress}` : ''}`,
                    );

                    await updateKeyboard(chatId, data.role);
                    await showMainMenu(chatId, data.role);

                } catch (e) {
                    console.error('Ошибка обработки данных:', e);
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

module.exports = { initBot, userSessions };