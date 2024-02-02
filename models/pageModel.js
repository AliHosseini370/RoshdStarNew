const mongoose = require('mongoose')


const Schema = mongoose.Schema


const pageSchema = new Schema ({
    pageNumber: {
        type: Number,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    banner: [{
        bannerUrl: {
            type: String
        }
    }]
})

module.exports = mongoose.model('Page', pageSchema)