import { Router } from "express";
import usersModels from "../dao/models/users.model.js"
import { usersManagers } from "../dao/ManagersMongoDB/usersManagersDB.js"


const routes = Router()
const um = new usersManagers()


routes.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body
        const user = await um.findUser(email)

        if (email !== user.email || password !== user.password) {
            res.redirect("/views/login")
        } else {
            req.session.user = { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
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

routes.post("/register", async (req, res) => {

        const {firstName, lastName, email, password} = req.body
        const resp = await um.addUser(firstName, lastName, email,password)
        resp.status === "OK" ?
        res.redirect("/views/login"):
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