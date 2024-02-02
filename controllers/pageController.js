const Page = require('../models/pageModel')
const mongoose = require('mongoose')

//get page data
const getPage = async (req, res) => {
    const pageNumber = req.params.pageNumber

    try {
        const page = await Page.findOne({pageNumber})
        if (!page) {
            return res.status(400).json({error: 'Page not found'})
        }

        res.status(200).json(page)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

//update page data
const updatePage = async (req, res) => {
    const pageNumber = req.params.pageNumber
    const updateFields = req.body
    try {
        const page = await Page.findOne({pageNumber})
        if (!page) {
            return res.status(400).json({error: 'Page not found'})
        }
        Object.assign(page, updateFields)
        page.save()
        res.status(200).json(page)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

module.exports = {
    getPage,
    updatePage
}