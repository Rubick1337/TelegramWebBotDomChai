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
    description: {type: DataTypes.TEXT, allowNull: false},
    rating: {type: DataTypes.FLOAT, defaultValue: 0},
    price: {type: DataTypes.DECIMAL(10, 2), allowNull: false},
    inStock: {type: DataTypes.BOOLEAN, defaultValue: true},
    img: {type: DataTypes.STRING, allowNull: false},
})

const ProductType = sequelize.define('product_type', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: true},
})

const Order = sequelize.define('order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    date: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    status: {type: DataTypes.ENUM('pending', 'processing', 'delivered', 'cancelled'), defaultValue: 'pending'},
    totalAmount: {type: DataTypes.DECIMAL(10, 2), allowNull: false},
    shippingAddress: {type: DataTypes.STRING, allowNull: false},
    qrCodeFileName: {type: DataTypes.STRING, allowNull: true}
})

const OrderItem = sequelize.define('order_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    quantity: {type: DataTypes.INTEGER, allowNull: false},
    price: {type: DataTypes.DECIMAL(10, 2), allowNull: false}
})

ProductType.hasMany(Product, {
    foreignKey: 'productTypeId'
});

Product.belongsTo(ProductType, {
    foreignKey: 'productTypeId'
});

User.hasMany(Order, {
    foreignKey: 'userId'
});

Order.belongsTo(User, {
    foreignKey: 'userId'
});

Order.hasMany(OrderItem, {
    foreignKey: 'orderId'
});

OrderItem.belongsTo(Order, {
    foreignKey: 'orderId'
});

OrderItem.belongsTo(Product, {
    foreignKey: 'productId'
});

Product.hasMany(OrderItem, {
    foreignKey: 'productId'
});

module.exports = {
    User,
    Product,
    ProductType,
    Order,
    OrderItem
}