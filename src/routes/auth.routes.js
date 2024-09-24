import { Router } from "express";
import moment from "moment";
import passport from "passport";

import initAuthStrategies from "../auth/passport.strategies.js";
import config from "../config.js";
import { usersManagers } from "../controller/users.manager.js";
import { createHash, createToken, isValidPassword, verifyRequiredBody, verifyToken } from "../services/utils.js";

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
        await um.updateLastLogin(req.session.user._id, "LOGIN")
        req.session.save(err => {
            if (err) {
                req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
                return res.status(500).send({ status: "ERROR", payload: null, error: err.message });
            }
            req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
            res.redirect(303, "/views/profile")
        })
    }
    catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.post("/jwtlogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", { failureMessage: "x" }), async (req, res) => {

    try {
        await um.updateLastLogin(req.user._id, "LOGIN")
        const token = createToken(req.user, "24h")
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
        res.status(200).send({ status: "OK", payload: req.user, token: token, cookieName: "boostCookie", maxAge: 86400 })
    }
    catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.get("/ghlogin", passport.authenticate("ghlogin", { scope: ["user:email"] }), async (req, res) => {
})

routes.get("/ghlogincallback", passport.authenticate("ghlogin", { failureMessage: "x" }), async (req, res) => {

    try {
        const token = createToken(req.user, "24h")
        await um.updateLastLogin(req.user._id, "LOGIN")
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
        const userInfo = JSON.stringify({ status: "OK", payload: req.user, token: token, cookieName: "boostCookie", maxAge: 86400 })
        res.status(200).send(
            `<!DOCTYPE html>
            <html lang="en">
            <body>
            </body>
            <script>
            window.opener.postMessage(${userInfo}, "http://localhost:5173")
            </script>
            </html>`
        )
    }
    catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.get("/ggllogin", passport.authenticate("ggllogin", { scope: ["profile", "email"] }), async (req, res) => {
})

routes.get("/gglogincallback", passport.authenticate("ggllogin", { failureMessage: "x" }), async (req, res) => {

    try {
        await um.updateLastLogin(req.user._id, "LOGIN")
        const token = createToken(req.user, "24h")
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
        const userInfo = JSON.stringify({ status: "OK", payload: req.user, token: token, cookieName: "boostCookie", maxAge: 86400 })
        res.status(200).send(
            `<!DOCTYPE html>
            <html lang="en">
            <body>
            </body>
            <script>
            window.opener.postMessage(${userInfo}, "http://localhost:5173")
            </script>
            </html>`
        )
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
        console.log(resp)
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
        if (resp.status === "OK") res.status(200).send({ status: "OK", payload: "El usuario ha sido registrado con éxito." })
        else throw new Error("El usuario ya se encuentra registrado.")
    } catch (err) {
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(400).send({ status: "ERROR", type: err.message })
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
        if (resp.status === "ERROR") throw new Error(resp.type)
        req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
        res.redirect("/views/login")
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        if (err.message === "No es posible concretar la solicitud debido a que excede el tiempo permitido o ya se ha realizado el cambio.")
            res.redirect(`/views/passwordrecovery?error=${encodeURI(`${err.message}`)}`)
        res.redirect(`/views/passwordchange/${prid}?error=${encodeURI(`${err.message}`)}`)
    }
})

routes.get("/current", verifyToken, async (req, res) => {
    try {
        if (req.user) {
            const filteredUser = await um.usersDTO(req.user)
            req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
            return res.status(200).send({ status: "OK", payload: filteredUser })
        } else {
            throw new Error("No hay usuarios activos.")
        }
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err.message}`)
        res.status(400).send({ status: "ERROR", error: err.message })

    }
})

routes.post("/logout", async (req, res) => {
    try {
        await um.updateLastLogin(req.session.user._id, "LOGOUT")
        req.session.destroy((err) => {
            if (err) {
                req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
                return res.status(500).send({ status: "ERROR", type: "No se ha podido completar la operación." })
            }

            req.logger.info(`${new moment().format()} ${req.method} auth${req.url}`)
            res.redirect("/views/login")
        })
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} auth${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})


export default routes