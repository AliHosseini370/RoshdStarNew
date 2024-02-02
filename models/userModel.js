const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const Schema = mongoose.Schema


const userSchema = new Schema ({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    password: {
        type: String
    }
}, {timestamps: true})

userSchema.statics.signup = async function (email, fullName, password) {
    if (!email || !fullName || !password) {
        throw Error('All Fields Must Be Filled')
    }
    if (!validator.isEmail(email)) {
        throw Error('Email Is Not Valid')
    }
    const exists = await this.findOne({ $or : [{ email }, {phoneNumber: password}]})
    if (exists) {
        if (exists.email === email) {
            throw Error('Email Already in use')
        }
        if (exists.phoneNumber === password) {
            throw Error('PhoneNumber Already in use')
        }
    }
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const user = await this.create({email, fullName, phoneNumber: password, password: hash})
    return user
}

userSchema.statics.login = async function (email, password) {
    if (!email || !password) {
        throw Error('All Fields Must Be Filled')
    }
    const user = await this.findOne({email})
    if (!user) {
        throw Error('Incorrect Email')
    }
    const match = await bcrypt.compare(password, user.password)
    console.log(password, user.password)
    if (!match) {
        throw Error('Incorrect Password')
    }
    
    return user
}



module.exports = mongoose.model('User', userSchema)