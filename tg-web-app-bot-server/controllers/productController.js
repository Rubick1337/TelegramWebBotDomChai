const {Product,ProductType} = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path');
const cache = require("../redis/cacheUtils")
const fs = require("fs");
const { Op } = require('sequelize');

class ProductController {
    async create(req, res, next) {
        try
        {
            const {name,description,price,inStock,productTypeId} = req.body
            const rating = 0;
            const {img} = req.files
            let fileName = uuid.v4()+ ".jpg"
            const prodcut = await Product.create({name,rating,description,price,inStock,img: fileName,productTypeId})
            img.mv(path.resolve(__dirname,'..','static',fileName));

            await cache.invalidateCache('products');

            return res.json(prodcut)
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }
    async getAll(req, res, next) {
        try {
            let { productTypeId, limit, page, search, sortOrder } = req.query;
            page = page || 1;
            limit = limit || 8;
            let offset = page * limit - limit;
            let products;
            let whereCondition = {};

            const cacheKey = cache.generateCacheKey('products',"getAll",{
                productTypeId, limit, page, search, sortOrder
            });

            const cachedProducts = await cache.getCache(cacheKey);

            if (cachedProducts) {
                console.log('Cache HIT:', cacheKey);
                return res.json(cachedProducts);
            }

            console.log('Cache MISS:', cacheKey);

            if (search) {
                whereCondition[Op.or] = [
                    {
                        name: {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    {
                        description: {
                            [Op.iLike]: `%${search}%`
                        }
                    }
                ];
            }

            if (productTypeId) {
                whereCondition.productTypeId = productTypeId;
            }

            let order = [];
            if (sortOrder === 'desc') {
                order = [['price', 'DESC']];
            } else if (sortOrder === 'asc') {
                order = [['price', 'ASC']];
            } else {
                order = [['createdAt', 'DESC']];
            }
            products = await Product.findAndCountAll({
                where: whereCondition,
                limit,
                offset,
                order
            });
            await cache.setCache(cacheKey, 3600, products);

            return res.json(products);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
    async getById(req, res, next) {
        try
        {
            const {id} = req.params

            const cacheKey = cache.generateCacheKey('products','getById',{id});
            const cachedProduct = await cache.getCache(cacheKey);
            if (cachedProduct) {
                console.log('Cache HIT for product:', id);
                return res.json(cachedProduct);
            }

            console.log('Cache MISS for product:', id);

            const product = await Product.findOne(
                {
                    where:{id},
                    include: {
                        model: ProductType,
                        as: 'productType', }
                }
            )
            await cache.setCache(cacheKey, 7200, product);
            return res.json(product)
        }
        catch (e) {
            next(ApiError.notFound(e.message))
        }
    }
    async edit(req, res, next) {
        try {
            const {name,description,price,inStock,productTypeId} = req.body;
            console.log(name,description,price,inStock,productTypeId);
            const { id } = req.params;

            const product = await Product.findByPk(id);
            if (!product) {
                return  next(ApiError.notFound("Продукт не найден"));
            }

            if (req.files && req.files.img) {
                const oldImg = product.img;

                if (oldImg) {
                    const oldImgPath = path.resolve(__dirname, '..', 'static', oldImg);
                    fs.unlinkSync(oldImgPath);
                }

                const { img } = req.files;
                const newFileName = uuid.v4() + ".jpg";

                await img.mv(path.resolve(__dirname, '..', 'static', newFileName));

                await product.update({
                    name,
                    description,
                    price,
                    inStock,
                    productTypeId,
                    img: newFileName,
                });
            } else {
                await product.update({
                    name,
                    description,
                    price,
                    inStock,
                    productTypeId,
                    });
            }
            await cache.invalidateCache('products');
            return res.json({ message: 'Продукт обновлен' });
        } catch (error) {
            console.error(error);
            return  next(ApiError.badRequest(error.message));
        }
    }
    async delete(req, res, next) {
        const { id } = req.params;
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                return  next(ApiError.notFound("Продукт не найден"))
            }
            if (product.img) {
                const imagePath = path.resolve(__dirname, '..', 'static', product.img);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error('Ошибка при удалении изображения:', err);
                    }
                });
            }
            await product.destroy();
            await cache.invalidateCache('products');
            return res.json({ message: 'Запись о продукте успешно удалена' });
        } catch (error) {
            console.error(error);
            return next(ApiError.notFound(error.message));
        }
    }
}
module.exports = new ProductController();