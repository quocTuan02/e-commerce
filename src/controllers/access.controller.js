'use strict';

const AccessService = require("../services/access.service");
const SuccessResponse = require("../core/success.response");

class AccessController {
    signUp = async (req, res, next) => {
        return new SuccessResponse({
            metadata: await AccessService.signUp(req.body)
        }).send(res)
    }
}

module.exports = new AccessController();