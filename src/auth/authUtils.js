'use strict';
const jwt = require('jsonwebtoken')
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // access token
        const accessToken = await jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days'
        })

        const refreshToken = await jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days'
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

module.exports = {
    createTokenPair
}