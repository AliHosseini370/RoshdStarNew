require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');
const pageRoutes = require('./routes/page')
const productRoutes = require('./routes/product')
const userRoutes = require('./routes/user')
const paymentRoutes = require('./routes/payment')

const app = express()


app.use(express.json())
app.use(cors({
    origin: ['https://www.startemali.ir', 'https://startemali.ir', 'http://localhost:5173']
}));
app.use('/api/pages', pageRoutes)
app.use('/api/products', productRoutes)
app.use('/api/user', userRoutes)
app.use('/api/payment', paymentRoutes)

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Connected to Mongo DB and listening on port', process.env.PORT)
        })
    })
    .catch( (error) => {
        console.log(error)
    })