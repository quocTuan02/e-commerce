'use strict';
const jwt = require('jsonwebtoken')
const asyncHandler = require("../helpers/asyncHandler");
const {AuthFailureError, BadRequestError} = require("../core/error.response");
const {findByUserId} = require("../services/keyToken.service");
const {StatusCodes} = require("../utils/httpStatusCode");
const JWT = require("jsonwebtoken");
const HEADER = {
    API_KEY: 'x-api-key', AUTHORIZATION: 'authorization', CLIENT_ID: 'x-client-id',
}
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // access token
        const accessToken = await jwt.sign(payload, privateKey, {
            algorithm: 'RS256', expiresIn: '2 days'
        })

        const refreshToken = await jwt.sign(payload, privateKey, {
            algorithm: 'RS256', expiresIn: '7 days'
        })

        // verify token

        jwt.verify(accessToken, publicKey, (error, decode) => {
            if (error) {
                console.log(`error verify::`, error)
            } else {
                console.log(`decode verify::`, decode)
            }
        })
        return {accessToken: accessToken, refreshToken: refreshToken}
    } catch (e) {

    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /**
     *  1. check userId missing ??
     *  2. get accessToken
     *  3. verifyToken
     *  4. check user in dbs
     *  5. check keyStore this userId
     *  6. OK all ==> return next()
     */
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) {
        throw new AuthFailureError('Invalid Request')
    }

    // 2.
    const keyStore = await findByUserId(userId)
    if (!keyStore) {
        throw new BadRequestError("Not found keyStore for user", StatusCodes.NOT_FOUND)
    }

    // 3.
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) {
        throw new AuthFailureError('Invalid Request')
    }

    // try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decodeUser.userId) {
        throw new AuthFailureError('Invalid User')
    }
    req.keyStore = keyStore
    return next()
    // }catch (e) {
    //     throw e
    // }

})

const verifyJWT = async (token, keySecret) => {
    return JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT
}