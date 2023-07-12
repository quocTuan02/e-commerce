'use strict';

const {StatusCodes, ReasonPhrases} = require("../utils/httpStatusCode");

class SuccessResponse {
    constructor({message = ReasonPhrases.OK, statusCode = StatusCodes.OK, metadata = {}}) {
        this.message = message
        this.statusCode = statusCode
        this.metadata = metadata
    }

    send(res, headers = {}) {
        return res
            .status(this.statusCode)
            .json(this)
    }
}

module.exports = SuccessResponse