//importing api's
const express = require('express')
const Users = require('./routes/users')
const Auth  = require('./routes/auth')
const Order = require('./routes/order')
const dashboard = require('./routes/dashboard')

module.exports = function(app){
//look for dependency
//Middlware
app.use(express.json())

app.use('/api/users',Users)
app.use('/api/auth',Auth)
app.use('/api/orders',Order)
app.use('/api/dashboard',dashboard)

// app.use(error)


}