const {ProductType, Product} = require('../models/models')
const ApiError = require('../error/ApiError')
const cache = require('../redis/cacheUtils')
const {Op} = require("sequelize");

class TypeController {
    async create(req, res) {
        const {name} = req.body
        const type = await ProductType.create({name})
        await cache.invalidateCache("types")
        return res.json(type)
    }
    async getAll(req, res) {
        let { limit, page, search } = req.query;
        console.log("Dasdas")
        console.log(req.query)
        let offset = page * limit - limit;
        let types;
        let whereCondition = {};
        const cacheKey = cache.generateCacheKey("types",'getAll',{limit, page, search});
        const cacheData = await cache.getCache(cacheKey);
        if(cacheData) {
            console.log("Cache Data:");
            return res.json(cacheData)
        }
        if (search) {
            whereCondition[Op.or] = [
                {
                    name: {
                        [Op.iLike]: `%${search}%`
                    }
                }
            ];
        }
        if(limit || page) {
           types = await ProductType.findAndCountAll({
                where: whereCondition,
                limit,
                offset,
            });
        }
        else
        {
            types = await ProductType.findAndCountAll({
            });
        }
        await cache.setCache(cacheKey,3600, types);
        return res.json(types)
    }
    async delete(req,res,next){
        const { id } = req.params;
        console.log("adsdasdsadsawq1231243")
        console.log(id)
        try {
            const type = await ProductType.findByPk(id);
            if (!type) {
                return ApiError.notFound('Тип продукта не найден');
            }
            await type.destroy();
            await cache.invalidateCache("types")
            return res.json({ message: 'Тип продукта удален успешно' });
        } catch (error) {
            return next(ApiError.internal(error.message));
        }
    }
    async edit(req,res,next){
        const { id } = req.params;
        try {

            const { name } = req.body;

            const type = await ProductType.findByPk(id);
            if (!type) {
                return ApiError.notFound('Тип продукта не найден');
            }

            await type.update({ name });
            await cache.invalidateCache("types")
            return res.json({ message: 'Тип продукта изменен успешно' });
        } catch (error) {
            return next(ApiError.internal(error.message));
        }
    }
}
module.exports = new TypeController();