const {StatusCodes} = require("http-status-codes");
const {Response} = require("../helpers");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Admin = require("../models/admin");

const authenticate = (audience) => {
    return async function (req, res, next) {
        if (req.method === 'OPTIONS') {
            return next()
        }

        if (!req.header('Authorization')) {
            return next()
        }

        const token = req.header('Authorization').replace("Bearer ", "")
        let decoded = null;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, {audience})
        } catch (e) {
            return next()
        }

        if (audience === 'user') {
            req.user = await User.findById(decoded.sub).exec()
        } else {
            req.user = await Admin.findById(decoded.sub).exec()
        }

        req.userId = decoded.sub
        req.audience = audience

        next()
    }
}

const requiresAuth = (req, res, next) => {
    if (!req.user) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(Response.error("Unauthorized"))
    }

    next()
}

module.exports = { authenticate, requiresAuth }
