const sequelize = require('../database');
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    adress: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
    role: {type: DataTypes.STRING, allowNull: false},
})

const Product = sequelize.define('product', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: false}, // описание
    rating: {type: DataTypes.FLOAT, defaultValue: 0}, // рейтинг
    price: {type: DataTypes.DECIMAL(10, 2), allowNull: false}, // цена
    inStock: {type: DataTypes.BOOLEAN, defaultValue: true}, // в наличии
    img: {type: DataTypes.STRING, allowNull: false},
})

const ProductType = sequelize.define('product_type', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: true}, // название типа
})

const Basket = sequelize.define('basket', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    status: {type: DataTypes.ENUM('active', 'completed', 'abandoned'), defaultValue: 'active'},
})

const BasketItem = sequelize.define('basket_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    quantity: {type: DataTypes.INTEGER, defaultValue: 1, allowNull: false},
})

const Order = sequelize.define('order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    orderNumber: {type: DataTypes.STRING, unique: true},
    date: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    status: {type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending'},
    totalAmount: {type: DataTypes.DECIMAL(10, 2), allowNull: false},
    shippingAddress: {type: DataTypes.STRING, allowNull: false},
})

const OrderItem = sequelize.define('order_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    quantity: {type: DataTypes.INTEGER, allowNull: false},
    price: {type: DataTypes.DECIMAL(10, 2), allowNull: false},
})

ProductType.hasMany(Product, {
    foreignKey: 'productTypeId',
    as: 'products'
});

Product.belongsTo(ProductType, {
    foreignKey: 'productTypeId',
    as: 'productType'
});

User.hasOne(Basket, {
    foreignKey: 'userId',
    as: 'basket'
});
Basket.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders'
});
Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Basket.hasMany(BasketItem, {
    foreignKey: 'basketId',
    as: 'items'
});
BasketItem.belongsTo(Basket, {
    foreignKey: 'basketId',
    as: 'basket'
});

BasketItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});
Product.hasMany(BasketItem, {
    foreignKey: 'productId',
    as: 'basketItems'
});

Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items'
});
OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
});

OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});
Product.hasMany(OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems'
});


Basket.hasOne(Order, {
    foreignKey: 'basketId',
    as: 'order'
});
Order.belongsTo(Basket, {
    foreignKey: 'basketId',
    as: 'basket'
});

module.exports = {
    User,
    Product,
    ProductType,
    Basket,
    BasketItem,
    Order,
    OrderItem
}