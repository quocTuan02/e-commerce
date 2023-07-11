'use strict';
const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service");
const {createTokenPair} = require("../auth/authUtils");
const {getInfoData} = require("../utils");
const {BadRequestError} = require("../core/error.response");
const _SALT = 10

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
}

class AccessService {

    static signUp = async ({name, email, password}) => {
        // step 1: check email exists ?
        const holderShop = await shopModel.findOne({email}).lean()
        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered!')
        }

        const passwordHash = await bcrypt.hash(password, _SALT)

        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            // created privateKey, publicKey
            const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'pkcs1',// pkcs8 : Public key Cryptographic Standard
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                }
            })
            // const privateKey = crypto.getRandomValues(64).toString('hex')
            // const publicKey = crypto.getRandomValues(64).toString('hex')

            console.log({privateKey, publicKey}) // save collision KeyStore

            const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey
            })

            if (!publicKeyString) {
                throw new BadRequestError('Error: PublicKeyString registered!')
            }

            const publicKeyObject = crypto.createPublicKey(publicKeyString)

            // created token pair
            const tokens = await createTokenPair(
                {userId: newShop._id, email},
                publicKeyObject,
                privateKey
            )
            console.log(`Created Token Success::`, tokens)

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({fields: ['_id', 'name', 'email'], object: newShop}),
                    tokens
                }
            }
        }
        return {
            code: 200,
            metadata: null
        }
    }
}

module.exports = AccessService