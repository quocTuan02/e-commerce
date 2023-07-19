'use strict';

const AccessService = require("../services/access.service");
const SuccessResponse = require("../core/success.response");

class AccessController {
    signUp = async (req, res, next) => {
        return new SuccessResponse({
            metadata: await AccessService.signUp(req.body)
        }).send(res)
    }

    login = async (req, res, next) => {
        return new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res)
    }

    logout = async (req, res, next) => {
        return new SuccessResponse({
            message: "You have been logged out",
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }

    handlerRefreshToken = async (req, res, next) => {
        return new SuccessResponse({
            message: "Get token successfully",
            metadata: await AccessService.handlerRefreshToken(req.body.refreshToken)
        }).send(res)
    }

}

module.exports = new AccessController();