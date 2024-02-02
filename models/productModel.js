const mongoose = require('mongoose')


const Schema = mongoose.Schema


const productSchema = new Schema ({
    pageNumber: {
        type: Number,
        required: true
    },
    image: {
        type: String,
    },
    secondImage: {
        type: String
    },
    title: {
        type:String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    url: {
        type: String,
    },
    audio: [{
        audioName: {
            type: String
        },
        audioUrl: {
            type: String,
        }
    }]
}, {timestamps : true})

module.exports = mongoose.model('Product', productSchema)