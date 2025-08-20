const Router = require('express')
const router = new Router()
const ProductController = require('../controllers/productController')

router.get('/', ProductController.getAll)
router.post('/', ProductController.create)
router.get("/:id", ProductController.getById)
router.put("/:id", ProductController.edit)
router.delete("/:id", ProductController.delete)

module.exports = router