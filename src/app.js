const PATH_ENV = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
require('dotenv').config({path: PATH_ENV});
const express = require('express')
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const app = express()

// console.log(process.env)
// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))


// init db
require('./dbs/init.mongodb')
// const {checkOverload} = require('./helpers/check.connect')
// checkOverload()

// init routes
app.use('', require('./routes'))


// handling error


module.exports = app