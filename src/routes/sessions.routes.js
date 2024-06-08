import { Router } from "express";
import usersModels from "../dao/models/users.model.js"
import { usersManagers } from "../dao/ManagersMongoDB/usersManagersDB.js"
import { createHash, isValidPassword } from "../utils.js"
import initAuthStrategies from "../auth/passport.strategies.js";
import passport from "passport";


const routes = Router()
const um = new usersManagers()
initAuthStrategies()

routes.post("/login", async (req, res) => {

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
                if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
                res.redirect("/views/profile")
            })
        }

    }
    catch (err) {
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.post("/pplogin", passport.authenticate("login", { failureRedirect: `/views/login?error=${encodeURI("usuario o clave no válidos")}` }), async (req, res) => {

    try {
        req.session.user = req.user
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
            res.redirect("/views/profile")
        })
    }
    catch (err) {
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.get("/ghlogin", passport.authenticate("ghlogin", { scope: ["user:email"] }), async (req, res) => {
})

routes.get("/ghlogincallback", passport.authenticate("ghlogin", { failureRedirect: `/views/login?error=${encodeURI("usuario o clave no válidos")}` }), async (req, res) => {

    try {
        req.session.user = req.user
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
            res.redirect("/views/profile")
        })
    }
    catch (err) {
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.get("/ggllogin", passport.authenticate("ggllogin", { scope: ["profile", "email"] }), async (req, res) => {
})

routes.get("/gglogincallback", passport.authenticate("ggllogin", { failureRedirect: `/views/login?error=${encodeURI("usuario o clave no válidos")}` }), async (req, res) => {

    try {
        req.session.user = req.user
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
            res.redirect("/views/profile")
        })
    }
    catch (err) {
        res.status(500).send({ status: "ERROR", type: err })
    }
})



routes.post("/register", async (req, res) => {

    const { firstName, lastName, email, password } = req.body
    const hashPassword = createHash(password)
    const resp = await um.addUser(firstName, lastName, email, hashPassword)
    resp.status === "OK" ?
        res.redirect("/views/login") :
        res.redirect("/views/register")
})


routes.post("/logout", async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) return res.status(500).send({ status: "ERROR", type: "No se ha podido completar la operación." })
            res.redirect("/views/login")
        })
    } catch (err) {
        console.log(`${err}`)
        res.status(500).send({ status: "ERROR", type: err })
    }
})

export default routes