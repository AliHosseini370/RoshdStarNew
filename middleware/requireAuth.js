const jwt = require('jsonwebtoken')
const User = require('../models/userModel')


const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({error: 'Authorization token required'})
    }
    const token = authorization.split(' ')[1]
    try {
        const {_id} = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id})
        if (!user) {
            return res.status(401).json({error: 'User not found'})
        }
        if (!user.isAdmin) {
            return res.status(403).json({error: 'access denied'})
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error.message);
        res.status(401).json({ error: 'Request is not authorized' });
    }
}

module.exports = requireAuth