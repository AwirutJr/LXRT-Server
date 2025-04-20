const express = require('express')
const Router = express.Router()

// middleware
const { userCheck, adminCheck} = require('../middleware/authcheck')

// controllers
const { create,list,remove } = require('../controller/category')

Router.post('/category',create)
Router.get('/list-category', list)
Router.delete('/delete-category/:id',remove)

module.exports = Router