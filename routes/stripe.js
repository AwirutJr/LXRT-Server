const express = require('express')
const Router = express.Router()

const {userCheck} = require('../middleware/authcheck')

//controller
const {payment} = require('../controller/stripe')

Router.post('/user/create-checkout-session',userCheck,payment)

module.exports = Router