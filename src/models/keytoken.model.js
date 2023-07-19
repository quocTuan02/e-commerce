'use strict';

const mongoose = require('mongoose')

const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'

const keyTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    },
    publicKey: {
        type: String,
        required: true,
    },
    privateKey: {
        // TODO: ???
        type: String,
        required: true,
        default: ''
    },
    refreshTokensUsed: {
        type: Array, // Những RT đã được sử dụng
        default: []
    },
    refreshToken: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

const keyTokenModel = mongoose.model(DOCUMENT_NAME, keyTokenSchema)
module.exports = keyTokenModel