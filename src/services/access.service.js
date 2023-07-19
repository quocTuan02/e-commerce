'use strict';
const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service");
const {createTokenPair, verifyJWT} = require("../auth/authUtils");
const {getInfoData} = require("../utils");
const {BadRequestError, AuthFailureError, ForbiddenError} = require("../core/error.response");
const {findByEmail} = require("./shop.service");
const _SALT = 10

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
}

class AccessService {
    static handlerRefreshToken = async (refreshToken) => {
        // Check xem token này đã được sử dụng chưa
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        // nếu có
        if (foundToken) {
            const {userId, email} = await verifyJWT(refreshToken, foundToken.publicKey)
            console.log("[1] ==>", {userId, email})
            // Xóa tất cả các key trong store
            await KeyTokenService.findByIdAndDelete(userId)
            throw new ForbiddenError("Something went wrong ! Please re-login")
        }

        const holderToken = await KeyTokenService.findByRefreshToken({refreshToken})
        if (!holderToken) {
            throw new AuthFailureError('Shop not registered')
        }
        // verifyToken
        const {userId, email} = await verifyJWT(refreshToken, holderToken.publicKey)
        console.log("[2] ==>", {userId, email})
        // check UserId
        const foundShop = await findByEmail({email})
        if (!foundShop) {
            throw  new BadRequestError('Shop not registered')
        }

        // create 1 cap token moi
        const tokens = await createTokenPair(
            {userId, email},
            holderToken.publicKey,
            holderToken.privateKey
        )
        // Update token
        await holderToken.setUpdate({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user: {userId, email},
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({delKey})
        return delKey;
    }

    /**
     * 1. check email in dbs
     * 2. match password
     * 3. create AT vs RT and save
     * 4. generate tokens
     * 5. get data return login
     * @param email
     * @param password
     * @param refreshToken
     * @returns {Promise<{shop: *, tokens: {accessToken: *|undefined, refreshToken: *|undefined}}>}
     */
    static login = async ({email, password, refreshToken = null}) => {
        const foundShop = await findByEmail({email})
        if (!foundShop) {
            throw  new BadRequestError('Shop not registered')
        }

        const match = await bcrypt.compare(password, foundShop.password)
        if (!match) {
            throw new AuthFailureError('Authentication failed')
        }
        const {_id: userId} = foundShop

        // created privateKey, publicKey
        const {privateKey, publicKey} = await crypto.generateKeyPairSync('rsa', {
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
        // console.log({privateKey, publicKey}) // save collision KeyStore

        const tokens = await createTokenPair(
            {userId, email},
            publicKey,
            privateKey
        )

        await KeyTokenService.createKeyToken({
            userId,
            refreshToken: tokens.refreshToken,
            publicKey,
            privateKey
        })

        return {
            shop: getInfoData({fields: ['_id', 'name', 'email'], object: foundShop}),
            tokens
        }

    }

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
                publicKey,
                privateKey
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