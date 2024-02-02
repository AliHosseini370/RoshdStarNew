const express = require('express')
const { getPage, updatePage} = require('../controllers/pageController')


const router = express.Router()

//get page data
router.get('/:pageNumber', getPage)

//update page
router.patch('/:pageNumber', updatePage)

module.exports = router