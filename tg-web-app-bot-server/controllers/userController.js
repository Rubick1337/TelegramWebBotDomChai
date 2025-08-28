const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Product} = require('../models/models');
const cache = require('../redis/cacheUtils')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const mailService = require('../service/mailService');
const tokenService = require('../service/tokenService');
const userDto = require('../dtos/userDto')
class UserController {

    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: 'Username и password обязательны' });
            }

            const user = await User.findOne({
                where: { username }
            });

            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Неверный пароль' });
            }


            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    adress: user.adress
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
            const { username, password, email, role = 'user', adress } = req.body;

            console.log('Parsed values:', { username, password, email, role });

            if (!username || !password || !email || !adress) {
                return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
            }

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

            const hashedPassword = await bcrypt.hash(password, 10);
            const activationLink = uuid.v4();

            const user = await User.create({
                username,
                password: hashedPassword,
                email,
                role,
                adress,
                activationLink,
                isActivated: false,
                refreshToken: ''
            });

            await mailService.sendActivationMail(email, `http://localhost:8000/api/user/activate/${activationLink}`);

            const UserDto = new userDto(user);
            const tokens = tokenService.generateToken({...UserDto});

            await tokenService.save(user.id, tokens.refreshToken);

            await cache.invalidateCache("users");
            res.cookie('refreshToken', user.refreshToken,{maxAge: 30*24*60*60*1000,httpOnly:true });
            return res.status(201).json({
                ...tokens,
                user: UserDto,
            });

        } catch (error) {
            console.error('Register error:', error);
            return res.status(500).json({ message: 'Ошибка сервера при регистрации' });
        }
    }
     async getAll(req, res, next) {
        try{
            let {limit, page, search } = req.query;
            page = page || 1;
            limit = limit || 8;
            console.log('Parsed values:', limit, page, search );
            let offset = page * limit - limit;
            let users;
            let whereCondition = {};
            const cacheKey = cache.generateCacheKey("users","getAll",{limit, page, search});
            const cacheData = await cache.getCache(cacheKey);
            if(cacheData) {
                console.log('Getting users from cache');
                return res.json(cacheData);
            }
            if (search) {
                whereCondition[Op.or] = [
                    {
                        username: {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    {
                        email: {
                            [Op.iLike]: `%${search}%`
                        }
                    }
                ]
            }
            users = await User.findAndCountAll({
                where: whereCondition,
                limit,
                offset
            })
            await cache.setCache(cacheKey,3600,users);
            return res.json(users);
        }
        catch(error) {
            return next(ApiError.internal(error.message));
        }
    }
    async updateRole(req, res,next) {
        try{
            const {role} = req.body;
            const { id } = req.params;
            const user = await User.findByPk(id);
            if (!user) {
                return  next(ApiError.notFound("Пользователь не найден"));
            }
            await user.update(
                {
                    role
                }
            )
            await cache.invalidateCache("users")
            return res.json({ message: 'Пользователь обновлен' });
        }
        catch(error) {
            return next(ApiError.internal(error.message));
        }
    }
    async logout(req, res,next) {
        try{

        }
        catch(error) {
            return next(ApiError.internal(error.message));
        }
    }
    async refresh(req, res,next) {
        try{

        }
        catch(error) {
            return next(ApiError.internal(error.message));
        }
    }
    async activate(req, res,next) {
        try{

        }
        catch(error) {
            return next(ApiError.internal(error.message));
        }
    }
}
module.exports = new UserController();