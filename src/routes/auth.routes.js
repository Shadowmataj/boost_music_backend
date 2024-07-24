import { Router } from "express";
import passport from "passport";
import initAuthStrategies from "../auth/passport.strategies.js";
import { usersManagers } from "../controller/users.manager.js";
import { createHash, isValidPassword, verifyRequiredBody, createToken } from "../services/utils.js";


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
                if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
                res.redirect("/views/profile")
            })
        }

    }
    catch (err) {
        res.status(500).send({ status: "ERROR", type: err })
    }
})

routes.post("/sessionslogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", { failureRedirect: `/views/login?error=${encodeURI("usuario o clave no válidos")}` }), async (req, res) => {

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

routes.post("/jwtlogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", { failureRedirect: `/views/login?error=${encodeURI("usuario o clave no válidos")}` }), async (req, res) => {

    try {
        const token = createToken(req.user, "1h")
        res.status(200).send({ status: "OK", payload: "Usuario autenticado", token: token })
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

    const { firstName, lastName, email, age, password } = req.body
    const hashPassword = createHash(password)
    const resp = await um.addUser(firstName, lastName, email, age, hashPassword)
    resp.status === "OK" ?
        res.redirect("/views/login") :
        res.redirect(`/views/register?error=${encodeURI(resp.type.message)}`)
})

routes.get("/current", async (req, res) => {
    try{
        if (req.session.user) {
            const filteredUser = await um.usersDTO(req.session.user)
            return res.status(200).send(filteredUser)
        } else {
            throw new Error("No hay usuarios activos.")
        }
    } catch (err){
        res.status(400).send({ status: "ERROR", error: err.message })
        
    }
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