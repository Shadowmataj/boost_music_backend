import { Router } from "express";
import moment from "moment";
import passport from "passport";

import initAuthStrategies from "../auth/passport.strategies.js";
import config from "../config.js";
import { usersManagers } from "../controller/users.manager.js";
import { createHash, createToken, filterAuth, isValidPassword, verifyRequiredBody } from "../services/utils.js";

const routes = Router()
const um = new usersManagers()
initAuthStrategies()

routes.post("/login", verifyRequiredBody(["email", "password"]), async (req, res) => {

    try {
        const { email, password } = req.body

        const options = { email: email }
        const user = await um.findUser(options)

        if (email !== user.email || isValidPassword(user, password)) {
            res.redirect("/views/login")
        } else {
            const { password, ...filteredFoundUser } = user
            req.session.user = filteredFoundUser
            req.session.save(err => {
                if (err) {
                    req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
                    return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
                }
                res.redirect("/views/profile")
            })
        }
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
    }
    catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.post("/sessionslogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", { failureRedirect: `/views/login?error=${encodeURI("usuario o clave no válidos")}` }), async (req, res) => {

    try {
        req.session.user = req.user 
        req.session.save(err => {
            if (err) {
                req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
                return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
            }
            req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
            res.redirect("/views/profile")
        })
    }
    catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.post("/jwtlogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", { failureRedirect: `/views/login?error=${encodeURI("usuario o clave no válidos")}` }), async (req, res) => {

    try {
        const token = createToken(req.user, "1h")
        res.status(200).send({ status: "OK", payload: "Usuario autenticado", token: token })
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
    }
    catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.get("/ghlogin", passport.authenticate("ghlogin", { scope: ["user:email"] }), async (req, res) => {
})

routes.get("/ghlogincallback", passport.authenticate("ghlogin", { failureRedirect: `/views/login?error=${encodeURI("usuario o clave no válidos")}` }), async (req, res) => {

    try {
        req.session.user = req.user
        req.session.save(err => {
            if (err) {
                req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
                return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
            }
            res.redirect("/views/profile")
        })
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
    }
    catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.get("/ggllogin", passport.authenticate("ggllogin", { scope: ["profile", "email"] }), async (req, res) => {
})

routes.get("/gglogincallback", passport.authenticate("ggllogin", { failureRedirect: `/views/login?error=${encodeURI("usuario o clave no válidos")}` }), async (req, res) => {

    try {
        req.session.user = req.user
        req.session.save(err => {
            if (err) {
                req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
                return res.status(500).send({ status: "OK", payload: null, error: err.message });
            }
            res.redirect("/views/profile")
        })
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
    }
    catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})


routes.post("/register", async (req, res) => {

    try {
        const { firstName, lastName, email, age, password } = req.body
        const hashPassword = createHash(password)
        const resp = await um.addUser(firstName, lastName, email, age, hashPassword)
        if (resp.status === "OK") res.redirect("/views/login")
        else res.redirect(`/views/register?error=${encodeURI(resp.type.message)}`)
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
    } catch (err) {
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
    }
})

routes.post("/passwordrecovery", async (req, res) => {
    const email = req.body.email
    try {
            await um.userPasswordRecovery(email)
            req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
            res.redirect("/views/login")
        } catch (err) {
            res.redirect("/views/passwordrecovery")
    }
})

routes.post("/passwordchange/:prid", async (req, res) => {
    const prid = req.params.prid 
    const newPassword = req.body.password
    try {
            const resp = await um.userPasswordChange(prid, newPassword)
            if(resp.status === "ERROR") throw new Error(resp.type)
            req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
            res.redirect("/views/login")
        } catch (err) {
            req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
            if(err.message === "No es posible concretar la solicitud debido a que excede el tiempo permitido o ya se ha realizado el cambio.") 
            res.redirect(`/views/passwordrecovery?error=${encodeURI(`${err.message}`)}`)
            res.redirect(`/views/passwordchange/${prid}?error=${encodeURI(`${err.message}`)}`)
    }
})

routes.get("/current", async (req, res) => {
    try {
        if (req.session.user) {
            const filteredUser = await um.usersDTO(req.session.user)
            req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
            return res.status(200).send(filteredUser)
        } else {
            req.logger.error(`${new moment().format()} ${req.method} auth${req.url}`)
            throw new Error("No hay usuarios activos.")
        }
    } catch (err) {
        res.status(400).send({ status: "ERROR", error: err.message })
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err.message}`)

    }
})

routes.post("/logout", async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
                return res.status(500).send({ status: "ERROR", type: "No se ha podido completar la operación." })
            }
            res.redirect("/views/login")
            req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
        })
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.put("/premium/:uid", filterAuth(["premium"]), async (req, res) => {
    const uid = req.params.uid
    try {
        const resp = await um.updateUser(uid) 
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
        res.status(200).send({ status: "OK", payload: resp.payload })
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})

export default routes