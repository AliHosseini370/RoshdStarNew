const express = require('express')
const { getProducts, getProduct, updateProduct, callSendProduct} = require('../controllers/productController')
const requireAuthAndAdmin = require('../middleware/requireAuth');

const router = express.Router()

//send a product
router.post('/email', callSendProduct)

//get all products
router.get('/', getProducts)


router.use(requireAuthAndAdmin)


//get a product
router.get('/:pageNumber', getProduct)


//update a product
router.patch('/:pageNumber', updateProduct)


module.exports = router