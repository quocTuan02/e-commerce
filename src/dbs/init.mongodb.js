'use strict';

const mongoose = require('mongoose')
const {db} = require('../configs/confg.mongodb')
const connectString = `mongodb://${db.host}:${db.port}/${db.name}`;
const {countConnect} = require('../helpers/check.connect')

// console.log(process.env)
class Database {
    constructor() {
        this.connect()
    }

    connect() {
        mongoose.connect(connectString, {
            maxPoolSize: 50,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // auth: {
            //     username: db.username,
            //     password: db.password,
            // }
        }).then(_ => {
            console.log('Connected Mongodb Success')
            countConnect()
        })
            .catch(error => {
                console.error('Error connecting to MongoDB:', error);
            })

        if (1 === 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', {color: true})
        }
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database()
        }

        return Database.instance
    }

}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb