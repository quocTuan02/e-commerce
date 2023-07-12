'use strict';
const mongoose = require('mongoose')
const DOCUMENT_NAME = 'Shop'
const COLLECTION_NAME = 'Shops'

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxLength: 150
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    verify: {
        type: mongoose.Schema.Types.Boolean,
        default: false
    },
    roles: {
        type: Array,
        default: []
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

// Create and export the model
const shopModel = mongoose.model(DOCUMENT_NAME, shopSchema)
module.exports = shopModel;