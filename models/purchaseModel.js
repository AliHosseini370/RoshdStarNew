const mongoose = require('mongoose')


const Schema = mongoose.Schema


const purchaseSchema = new Schema ({
    userFullName: {
        type: String,
        required: true
    },
    userEmail : {
        type: String,
        required: true
    },
    productTitle : {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema)