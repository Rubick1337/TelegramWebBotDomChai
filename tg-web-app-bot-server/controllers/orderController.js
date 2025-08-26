const {Order, OrderItem, Product, User} = require('../models/models')
const cache = require("../redis/cacheUtils")

class OrderController {
    async getAll(req, res) {
        try {
            const {status, search, page = 1, limit = 10} = req.query
            const offset = (page - 1) * limit
            const whereConditions = {}
            const cacheKey = cache.generateCacheKey("orders","getAll",{status, search, page, limit})
            const cacheData = await cache.getCache(cacheKey)

            if (cacheData) {
                console.log("cache data")
                return res.json(cacheData)
            }
            if (status && status !== 'all') {
                whereConditions.status = status
            }

            let includeConditions = [{
                model: OrderItem,
                include: [Product]
            }]

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
            await cache.setCache(cacheKey, 3600, orders);
            return res.json({
                orders,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalCount: count
            })

        } catch (error) {
            console.error('Order getAll error:', error)
            return res.status(500).json({message: 'Ошибка при получении заказов'})
        }
    }

    async getOne(req, res) {
        try {
            const {id} = req.params
            const cacheKey = cache.generateCacheKey("orders","getById",{id})
            const cacheData = await cache.getCache(cacheKey)

            if (cacheData) {
                console.log("cache data")
                return res.json(cacheData)
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