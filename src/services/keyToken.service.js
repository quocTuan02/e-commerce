'use strict'
const keyTokenModel = require('../models/keytoken.model')
const {Types} = require("mongoose");

class KeyTokenService {

    static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
        try {
            const publicKeyString = publicKey.toString()
            const privateKeyString = privateKey.toString()
            const filter = {user: userId}, update = {
                publicKey: publicKeyString,
                privateKey: privateKeyString,
                refreshTokensUsed: [],
                refreshToken,
            }, options = {upsert: true, new: true}

            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

            // const publicKeyString = publicKey.toString()
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey: publicKeyString
            // })
            //
            return tokens ? tokens.publicKey : null
        } catch (e) {
            return e
        }
    }

    static findByUserId = async (userId) => {
        // return keyTokenModel.findOne({user: Types.ObjectId(userId)}).lean();
        return keyTokenModel.findOne({user: userId}).lean();
    }

    static removeKeyById = async (id) => {
        return keyTokenModel.deleteOne(id);
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return keyTokenModel.findOne({refreshTokenUsed: refreshToken}).lean()
    }

    static findByRefreshToken = async (refreshToken) => {
        return keyTokenModel.findOne({refreshToken: refreshToken});
    }

    static findByIdAndDelete = async (userId) => {
        return keyTokenModel.findByIdAndDelete({user: userId})
    }


}

module.exports = KeyTokenService