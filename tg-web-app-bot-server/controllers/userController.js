
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models/models');


class UserController {

    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: 'Username и password обязательны' });
            }

            // Поиск пользователя
            const user = await User.findOne({
                where: { username }
            });

            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            // Проверка пароля
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Неверный пароль' });
            }


            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Ошибка сервера при авторизации' });
        }
    }

    async register(req, res) {
        try {
            console.log('Request body:', req.body);
            const { username, password, email, role = 'user' } = req.body;

            console.log('Parsed values:', { username, password, email, role });

            if (!username || !password || !email) {
                return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
            }

            // Проверка на существующего пользователя
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { username },
                        { email }
                    ]
                }
            });

            if (existingUser) {
                return res.status(409).json({
                    message: 'Пользователь с таким username или email уже существует'
                });
            }

            // Хеширование пароля
            const hashedPassword = await bcrypt.hash(password, 10);

            // Создание пользователя
            const user = await User.create({
                username,
                password: hashedPassword,
                email,
                role
            });


            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Ошибка сервера при регистрации' });
        }
    }
    async logout(req, res) {

    }
    async check(req, res) {

    }
}
module.exports = new UserController();