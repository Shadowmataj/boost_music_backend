import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import config, { errorsDictionary } from "../config.js"
import CustomError from "./customError.class.js"

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)

export const createToken = (payload, duration) => jwt.sign(payload, config.SECRET, { expiresIn: duration })

export const verifyToken = (req, res, next) => {
    // Header Authorization: Bearer <token>
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`] : undefined;
    const queryToken = req.query.access_token ? req.query.access_token : undefined;
    const receivedToken = headerToken || cookieToken || queryToken;

    if (!receivedToken) return res.status(401).send({ Error: "ERROR", payload: 'Se requiere token' });

    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        if (err) return res.status(403).send({ Error: "ERROR", payload: 'Token no válido' });
        req.user = payload;
        next();
    });
}

export const verifyRequiredBody = (requiredFields) => {
    return (req, res, next) => {
        const allOk = requiredFields.every(field =>
            req.body.hasOwnProperty(field) && req.body[field] !== '' && req.body[field] !== null && req.body[field] !== undefined
        )
        if (!allOk) {
            throw new CustomError(errorsDictionary.FEW_PARAMETERS)
        }
        next()
    }
}

// Middleware to authoraize the acceses depending on the user's rol
export const filterAuth = (role) => {
    return (req, res, next) => {
        if (req.session.user === undefined) return res.redirect("/views/login")
        else if (req.session.user.role !== role) throw new CustomError(errorsDictionary.AUTH_ERROR)
        next();
    }
}