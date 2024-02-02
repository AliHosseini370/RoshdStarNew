const express = require('express')
const { getUsers, userSignup, sendVerficationCode, userLogin, adminLogin, userDelete, userUpdate, isAdmin} = require('../controllers/userController')
const requireAuthAndAdmin = require('../middleware/requireAuth');


const router = express.Router()


router.get('/isadmin', isAdmin)

//create a new user
router.post('/signup', userSignup)

//login user
router.post('/login', userLogin)

//admin login
router.post('/admin/login', adminLogin)

//for routes that requires auth
router.use(requireAuthAndAdmin)

//get all users
router.get('/', getUsers)

//delete user
router.delete('/delete/:id', userDelete)

//update user
router.patch('/update/:id', userUpdate)

module.exports = router