const Product = require('../models/productModel')
const nodemailer = require('nodemailer')
const axios = require('axios')

//get all products
const getProducts = async (req, res) => {
    const { authorization } = req.headers
    try {
        if (!authorization) {
            return res.status(401).json({error: 'Authorization Api required'})
        }
        if (authorization !== process.env.API_KEY) {
            return res.status(401).json({error: 'Access Denied'})
        }
        const products = await Product.find({}).sort({ createdAt : -1})
        if (!products) {
            return res.status(404).json({error: 'Cant Find any products'})
        }
        res.status(200).json(products)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

//get a single product
const getProduct = async (req, res) => {
    const pageNumber = req.params.pageNumber

    try {
        const product = await Product.findOne({pageNumber})
        if (!product) {
            return res.status(404).json({error: 'No such product'})
        }
        res.status(200).json(product)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

//update product
const updateProduct = async (req, res) => {
    const pageNumber = req.params.pageNumber
    const updateFields = req.body
    console.log(updateFields)

    try {
        const product = await Product.findOne({pageNumber})
        if (!product) {
            return res.status(404).json({error: 'No such product'})
        }
        Object.assign(product, updateFields)
        product.save()
        res.status(200).json(product)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

//send a product
const sendProduct = async ({email, password, _id}) => {
    if (!email) {
        throw Error('Email is Required')
    }
    if (!_id) {
        throw Error('Product ID is Required')
    }
    const product = await Product.findOne({_id})
    if (!product) {
        throw Error('No Such product')
    }
    const transporter = nodemailer.createTransport({
        host: process.env.HOST_MAIL,
        port: process.env.PORT_MAIL,
        secure: true,
        auth : {
            user: 'info@roshdstar.ir',
            pass: process.env.HOST_PASS
        }
    })
    const html = `
        <head>
            <style type="text/css" media="all">
                a {
                    text-decoration: none;
                    color: #0088cc;
                }
                hr {
                    border-top: 1px solid #4296ff;
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0;">

            <table style="background-color: #294559; width: 100%;" cellspacing="0" cellpadding="0">
                <tr>
                    <td style="padding: 10px; text-align: center; color: #e9c46a; font-size: 24px; font-weight: bold;">
                        <h1> رشـد اسـتار </h1> <br>
                        <a style="color: #fff ;font-size: 18px "href="https://www.instagram.com/roshdstar">ما را در اینستاگرام دنبال کنید</a>
                </td>
                </tr>
            </table>
 
            <div style="background-color: #fff; width: 100%; padding: 15px; font-size: 16px; text-align: center">
                <p>با سلام و تشکر از خرید شما،
                .امیدواریم که از محصولی که انتخاب کرده‌اید لذت ببرید و از آن بهره‌مند شوید <br>
                
                .اگر سوال یا نیاز به کمک داشتید، همیشه در دسترس هستیم تا شما را راهنمایی کنیم<br>
                
                .با تشکر مجدد از خرید شما و اعتمادی که به ما داشتید <br>
                
                با احترام،
                تیم رشد استار</p>
                ${product.url ? `<a href="${product.url}">لینک دانلود ${product.title}</a><br>` : ''}
                <br>
                ${product.image ? `<img src="${product.image}" width="250" height="257" /> <br>` : ''}
                ${product.audio.filter(audio => audio.audioName && audio.audioUrl).map((audio, index) => (
                    `<a href=${audio.audioUrl}>${audio.audioName}</a><br>`
                ))}
            </div>

        </body>
    `
    const mailOptions = {
        from: 'info@roshdstar.ir',
        to: email,
        subject: product.title,
        html: html
    }
    const url = 'http://ippanel.com/api/select'
    const formData = {
        op: "pattern",
        user: process.env.SMS_USER,
        pass:  process.env.SMS_PASS,
        fromNum: "5000125475",
        toNum: password,
        patternCode: "9fifg544evbworl",
    }
    try {
        const info = await transporter.sendMail(mailOptions)
        if (!info) {
            throw Error('Enter a Valid Email adress')
        }
        if (_id !== '64fa40d81da0f97a7295096b') {
            const sendText = await axios.post(url, formData)
        }
        return info
    } catch (error) {
        console.log(error)
        throw Error(error.message)
    }
}

const callSendProduct = async (req, res) => {
    const { email, password, _id, apiKey } = req.body
    try { 
        if (!apiKey) {
            return res.status(401).json({error: 'Authorization Api required'})
        }
        if (apiKey !== process.env.API_KEY) {
            return res.status(401).json({error: 'Access Denied'})
        }
        const response = await sendProduct({email, password, _id})
        if (!response) {
            return res.status(400).json({error: 'Somthing Went wrong'})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

module.exports = {
    getProduct,
    getProducts,
    updateProduct,
    sendProduct,
    callSendProduct
}