import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './FormStyle.css';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTelegram, setIsTelegram] = useState(false);

    const API_URL = 'http://localhost:8000/api/user';

    useEffect(() => {
        // Проверяем, открыто ли в Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
            setIsTelegram(true);
            // Инициализируем Telegram Web App
            window.Telegram.WebApp.expand();
            window.Telegram.WebApp.enableClosingConfirmation();

            // Настраиваем основную кнопку
            window.Telegram.WebApp.MainButton.setParams({
                text: isLogin ? 'Войти' : 'Зарегистрироваться'
            });
        }
    }, [isLogin]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTelegramAuth = useCallback(async () => {
        setLoading(true);
        setMessage('');

        try {
            const url = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
            console.log('Отправка запроса на:', url, 'с данными:', formData);

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Ответ сервера:', response.data);

            if (response.data && response.data.user) {
                const userData = response.data.user;
                setMessage(isLogin ? 'Успешный вход!' : 'Регистрация успешна!');

                // Сохраняем данные пользователя
                localStorage.setItem('user', JSON.stringify(userData));


                const telegramData = {
                    username: userData.username,
                    role: userData.role,
                    email: userData.email,
                    userId: userData.id,
                    adress: userData.adress,
                };

                console.log('Отправка данных в Telegram:', telegramData);
                window.Telegram.WebApp.sendData(JSON.stringify(telegramData));

                // Закрываем веб-приложение через 1 секунду
                setTimeout(() => {
                    window.Telegram.WebApp.close();
                }, 1000);
            }

        } catch (error) {
            console.error('Ошибка запроса:', error);

            if (error.response) {
                const errorMsg = error.response.data?.message || 'Ошибка сервера';
                setMessage(errorMsg);
                window.Telegram.WebApp.showPopup({
                    title: 'Ошибка',
                    message: errorMsg,
                    buttons: [{ type: 'ok' }]
                });
            } else if (error.request) {
                setMessage('Нет ответа от сервера');
                window.Telegram.WebApp.showPopup({
                    title: 'Ошибка',
                    message: 'Нет ответа от сервера. Проверьте подключение.',
                    buttons: [{ type: 'ok' }]
                });
            } else {
                setMessage('Ошибка при отправке запроса');
            }
        } finally {
            setLoading(false);
        }
    }, [formData, isLogin]);

    useEffect(() => {
        if (isTelegram) {
            window.Telegram.WebApp.onEvent('mainButtonClicked', handleTelegramAuth);
            return () => {
                window.Telegram.WebApp.offEvent('mainButtonClicked', handleTelegramAuth);
            };
        }
    }, [isTelegram, handleTelegramAuth]);

    useEffect(() => {
        if (isTelegram) {
            if (!formData.username || !formData.password || (!isLogin && !formData.email)) {
                window.Telegram.WebApp.MainButton.hide();
            } else {
                window.Telegram.WebApp.MainButton.show();
            }
        }
    }, [isTelegram, formData, isLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isTelegram) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const url = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.user) {
                setMessage(isLogin ? 'Успешный вход!' : 'Регистрация успешна!');
                const userData = response.data.user;
                localStorage.setItem('user', JSON.stringify(userData));

                setTimeout(() => {
                    window.location.href = '/products';
                }, 1000);
            }

        } catch (error) {
            console.error('Ошибка запроса:', error);
            if (error.response) {
                setMessage(error.response.data?.message || 'Ошибка сервера');
            } else if (error.request) {
                setMessage('Нет ответа от сервера');
            } else {
                setMessage('Ошибка при отправке запроса');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required={!isLogin}
                                placeholder="Email"
                                className="form-input"
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Username"
                            className="form-input"
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Password"
                            className="form-input"
                        />
                    </div>

                    {!isTelegram && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-button"
                        >
                            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
                        </button>
                    )}
                </form>

                {message && (
                    <div className={`message ${message.includes('Успеш') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                {isTelegram && loading && (
                    <div className="message info">
                        Обработка запроса...
                    </div>
                )}

                <div className="auth-switch">
                    <span>
                        {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            if (isTelegram) {
                                window.Telegram.WebApp.MainButton.setParams({
                                    text: !isLogin ? 'Войти' : 'Зарегистрироваться'
                                });
                            }
                        }}
                        className="switch-button"
                    >
                        {isLogin ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;