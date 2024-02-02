const Purchase = require('../models/purchaseModel')
const ZarinpalPayment = require('zarinpal-pay')
const zarinpal = new ZarinpalPayment(process.env.ZARIN_MERCHANT, true)
const { sendProduct } = require('./productController')

const getPayments = async (req,res) => {
    try {
        const payments = await Purchase.find({}).sort({createdAt: -1})
        if (!payments) {
            return res.status(404).json({error: 'Cant Find Any Payments'})
        }
        res.status(200).json(payments)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const createPayment = async(req, res) => {
    const { title, amount, password, email, fullName, productID} = req.body
    const encodedEmail = encodeURIComponent(email);
    const encodedTitle = encodeURIComponent(title);
    const encodedPassword = encodeURIComponent(password)
    const encodedFullName = encodeURIComponent(fullName)
    const encodedProductId = encodeURIComponent(JSON.stringify(productID))
    try {
        const paymentResponse = await zarinpal.create({
            amount: amount,
            callback_url: `${process.env.CALLBACK_URL}?amount=${amount}&email=${encodedEmail}&fullName=${encodedFullName}&title=${encodedTitle}&password=${encodedPassword}&productID=${encodedProductId}`,
            mobile: password,
            email: email,
            description: `خرید : ${title}`
        })
        if (paymentResponse.data.code !== 100) {
            return res.status(400).json({error: 'Failed to create payment request'})
        }
        res.status(200).json(paymentResponse.data)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const paymentCallback = async (req, res) => {
    const { Authority, amount, email, fullName, title, Status, password, productID } = req.query
    const price = Number(amount)
    const parsedIds = JSON.parse(productID);
    try {
        if (Status !== 'OK') {
            switch (parsedIds[0]) {
                case '64fa436f1da0f97a7295096e':
                    return res.redirect('https://www.startemali.ir/step5afterpay')
                case '653510341d45d80da065b9a1':
                    return res.redirect('https://www.startemali.ir/step6afterpay')
                default:
                    break;
            }
            return res.redirect('https://www.startemali.ir/step4');
        }
        const verifyPay = await zarinpal.verify({authority: Authority, amount: price})
        console.log(verifyPay)
        if (verifyPay.data.code !== 100) {
            return res.redirect('https://www.startemali.ir/step4');
        }
        const purchase = await Purchase.create({productTitle: title, userEmail: email, userFullName: fullName, amount: price})

        for (let i = 0; i < parsedIds.length; i++) {
            await sendProduct({email, password, _id: parsedIds[i]})
        }

        if (parsedIds[0] === '64fa436f1da0f97a7295096e' || parsedIds[0] === '6511aca5e3c00c7019650f6f') {
            return res.redirect('https://www.startemali.ir/greeting/Learn')
        }
        res.redirect('https://www.startemali.ir/step5afterpay');
    } catch (error) {
        console.log(error.message)
        res.status(400).json({error: error.message})
    }
}


module.exports = {
    getPayments,
    createPayment,
    paymentCallback
}
