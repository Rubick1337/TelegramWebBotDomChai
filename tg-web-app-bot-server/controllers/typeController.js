const {ProductType} = require('../models/models')
const ApiError = require('../error/ApiError')

class TypeController {
    async create(req, res) {
        const {name} = req.body
        const type = await ProductType.create({name})
        return res.json(type)
    }
    async getAll(req, res) {
        const types = await ProductType.findAll();
        return res.json(types)
    }
    async delete(req,res,next){
        const { id } = req.query;

        try {
            const type = await ProductType.findByPk(id);
            if (!type) {
                return ApiError.notFound('Тип продукта не найден');
            }
            await type.destroy();
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
            return res.json({ message: 'Тип продукта изменен успешно' });
        } catch (error) {
            return next(ApiError.internal(error.message));
        }
    }
}
module.exports = new TypeController();