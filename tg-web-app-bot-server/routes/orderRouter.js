const Router = require('express')
const router = new Router()
const orderController = require('../controllers/orderController')

// Все routes защищены аутентификацией
router.get('/', orderController.getAll)
router.get('/:id',  orderController.getOne)
router.post('/',  orderController.create)
router.put('/:id/status',  orderController.updateStatus)


module.exports = router