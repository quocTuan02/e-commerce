'use strict';
const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service");
const {createTokenPair} = require("../auth/authUtils");
const _SALT = 10

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
}

class AccessService {

    static signUp = async ({name, email, password}) => {
        try {
            // step 1: check email exists ?
            const shop = await shopModel.findOne({email}).lean()
            if (shop) {
                return {
                    code: 'xxx',
                    message: 'Shop already exists'
                }
            }

            const passwordHash = await bcrypt.hash(password, _SALT)
            const newShop = await shopModel.create({
                name, email, passwordHash, roles: [RoleShop.SHOP]
            })

            if (newShop) {
                // created privateKey, publicKey
                const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096
                })
                console.log({privateKey, publicKey}) // save collision KeyStore

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey
                })

                if (!publicKeyString) {
                    return {
                        code: 'xxx',
                        message: 'publicKeyString error'
                    }
                }
                // created token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                console.log(`Created Token Success::`, tokens)

                return {
                    code: 201,
                    metadata: {
                        shop: newShop,
                        tokens
                    }
                }
            }
            return {
                code: 200,
                metadata: null
            }
        } catch (e) {
            console.log(e)
            return {
                code: 'xxx',
                message: e.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService