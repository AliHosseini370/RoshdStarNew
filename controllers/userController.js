const User = require('../models/userModel')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const MailerLite = require('@mailerlite/mailerlite-nodejs').default;

const mailerlite = new MailerLite({
  api_key: process.env.MAILER_LITE_API
});

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.JWT_SECRET, {expiresIn: '100 years'})
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1})
        if (!users) {
            return res.status(404).json({error: 'Cant Find Any Users'})
        }
        res.status(200).json(users)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const userSignup = async (req, res) => {
  const { email, fullName, password } = req.body
  
  if (!email || !fullName || !password) {
    return res.status(400).json({error: 'All Fields Must Be Filled'})
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({error: 'Email is not valid'})
  }

const params = {
    email: email,
    fields: {
      phone: password,
    },
  };
  try {
    mailerlite.subscribers.createOrUpdate(params)
        .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        if (error.response) console.log(error.response.data);
    });
    const user = await User.signup(email, fullName, password)
    //create token
    const token = createToken(user._id)
    if (!user) {
        return res.status(400).json({error: 'Somthing Went wrong'})
    }
    res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const userLogin = async (req, res) => {
    const {email, password, code} = req.body
    const isValid = await validateVerficationCode(code)
    if (!isValid) {
        return res.status(400).json({error: 'Invalid Verfication Code'})
    }
    try {
        const user = await User.login(email, password)
        const token = createToken(user._id)
        res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const adminLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.login(email, password)
        if (!user.isAdmin) {
            return res.status(401).json({error: 'User is not admin'})
        }
        const token = createToken(user._id)
        res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const userDelete = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such User'})
    }
    try {
        const user = await User.findOneAndDelete({_id: id})
        if (!user) {
            return res.status(400).json({error: 'No Such User'})
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const userUpdate = async (req, res) => {
    const { id } = req.params
    const { email, password } = req.body
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such User'})
    }
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    try {
        const user = await User.findOneAndUpdate({_id: id}, {email, password: hash, phoneNumber: password})
        if (!user) {
            return res.status(400).json({error: 'No Such User'})
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const isAdmin = async (req, res) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({error: 'Authorization token required'})
    }
    const token = authorization.split(' ')[1]
    try {
        const {_id} = await jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id})
        if (!user) {
            return res.status(401).json({error: 'User not found'})
        }
        if (!user.isAdmin) {
            return res.status(403).json({error: 'access denied'})
        }
        res.status(200).json(user)
    } catch (error) {
        console.log(error.message);
        res.status(401).json({ error: 'Request is not authorized' });
    }
}


module.exports = {
    getUsers,
    userSignup,
    userLogin,
    adminLogin,
    userDelete,
    userUpdate,
    isAdmin
}