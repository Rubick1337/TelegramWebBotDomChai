const Router = require("express")
const router = new Router()
const userRouter = require("../routes/userRouter")
const typeRouter = require("../routes/typeRouter")
const productRouter = require("../routes/productRouter")

router.use('/user', userRouter)
router.use('/product/type',typeRouter)
router.use('/product',productRouter)
module.exports = router