const {Order, OrderItem, Product, User} = require('../models/models')
const cache = require("../redis/cacheUtils")

class OrderController {
    async getAll(req, res) {
        try {
            const {status, search, page = 1, limit = 10, userId} = req.query
            const offset = (page - 1) * limit
            const whereConditions = {}

            // Генерируем ключ кэша
            const cacheKey = cache.generateCacheKey("orders",'getAll',{status, search, page, limit, userId});

            // Проверяем кэш
            const cacheData = await cache.getCache(cacheKey);
            if(cacheData) {
                console.log("Cache Data for orders:");
                // Убедимся, что возвращаем правильную структуру
                if (cacheData.orders && Array.isArray(cacheData.orders)) {
                    return res.json(cacheData);
                }
                // Если в кэше некорректные данные, продолжаем без кэша
                console.log("Invalid cache data, fetching from DB");
            }

            if (status && status !== 'all') {
                whereConditions.status = status
            }

            // Добавляем фильтр по userId если он передан
            if (userId) {
                whereConditions.userId = userId
            }

            let includeConditions = [{
                model: OrderItem,
                include: [Product]
            }]

            // Для админов добавляем информацию о пользователе
            if (req.user && req.user.role === 'admin') {
                includeConditions.push({
                    model: User,
                    attributes: ['id', 'username', 'email', 'adress', 'role']
                })
            }

            if (search) {
                if (!isNaN(search)) {
                    whereConditions.id = parseInt(search)
                }
            }

            const {count, rows: orders} = await Order.findAndCountAll({
                where: whereConditions,
                include: includeConditions,
                order: [['date', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            })

            // Гарантируем, что orders всегда массив
            const result = {
                orders: orders || [],
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalCount: count
            }

            // Сохраняем в кэш только если данные валидны
            if (Array.isArray(orders)) {
                await cache.setCache(cacheKey, 3600, result);
            }

            return res.json(result)

        } catch (error) {
            console.error('Order getAll error:', error)
            // Возвращаем пустой массив при ошибке
            return res.json({
                orders: [],
                totalPages: 0,
                currentPage: 1,
                totalCount: 0
            })
        }
    }

    async getOne(req, res) {
        try {
            const {id} = req.params

            // Генерируем ключ кэша
            const cacheKey = cache.generateCacheKey("orders",'getOne',{id});

            // Проверяем кэш
            const cacheData = await cache.getCache(cacheKey);
            if(cacheData) {
                console.log("Cache data for order details");
                // Проверяем валидность данных в кэше
                if (cacheData && cacheData.id) {
                    return res.json(cacheData);
                }
                console.log("Invalid cache data, fetching from DB");
            }

            const order = await Order.findOne({
                where: {id},
                include: [{
                    model: OrderItem,
                    include: [Product]
                }]
            })

            if (!order) {
                return res.status(404).json({message: 'Заказ не найден'})
            }

            // Сохраняем в кэш
            await cache.setCache(cacheKey, 3600, order);

            return res.json(order)

        } catch (error) {
            console.error('Order getOne error:', error)
            return res.status(500).json({message: 'Ошибка при получении заказа'})
        }
    }


    async create(req, res) {
        try {
            const {items, totalAmount, shippingAddress, userId} = req.body

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({message: 'Нет товаров в заказе'})
            }

            const order = await Order.create({
                userId: userId || null,
                totalAmount,
                shippingAddress,
                status: 'pending'
            })

            const orderItems = items.map(item => ({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            }))

            await OrderItem.bulkCreate(orderItems)

            const fullOrder = await Order.findOne({
                where: {id: order.id},
                include: [{
                    model: OrderItem,
                    include: [Product]
                }]
            })
            await cache.invalidateCache("orders")
            return res.status(201).json(fullOrder)

        } catch (error) {
            console.error('Order create error:', error)
            return res.status(500).json({message: 'Ошибка при создании заказа'})
        }
    }

    async updateStatus(req, res) {
        try {
            const {id} = req.params
            const {status} = req.body

            const validStatuses = ['pending', 'processing', 'delivered', 'cancelled']
            if (!validStatuses.includes(status)) {
                return res.status(400).json({message: 'Неверный статус заказа'})
            }

            const order = await Order.findByPk(id)

            if (!order) {
                return res.status(404).json({message: 'Заказ не найден'})
            }

            await order.update({status})
            await cache.invalidateCache("orders")
            return res.json(order)

        } catch (error) {
            console.error('Order updateStatus error:', error)
            return res.status(500).json({message: 'Ошибка при обновлении статуса'})
        }
    }
}

module.exports = new OrderController()