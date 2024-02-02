const express = require('express')

const { createPayment, paymentCallback, getPayments} = require('../controllers/paymentController')

const router = express.Router()

router.get('/', getPayments)

router.post('/', createPayment)

router.get('/callback', paymentCallback)



module.exports = router