import { Router } from "express";
import moment from "moment";

import { usersManagers } from "../controller/users.manager.js";
import { filterAuth, verifyToken } from "../services/utils.js";
import { uploader } from "../services/uploader.js";

const routes = Router()
const um = new usersManagers()

routes.get("/", verifyToken, filterAuth(["admin"]), async (req, res) => {
    const limit = +(req.query.limit || 9)
    const page = +(req.query.page || 1)
    const sort = +(req.query.sort || 0)

    try {
        const resp = await um.getUsers(limit, page, sort)
        if (resp.status === "OK") {
            req.logger.info(`${new moment().format()} ${req.method} api/users${req.url}products/`)
            res.status(200).send(resp)
        } else if (resp.status === "ERROR") {
            req.logger.error(`${new moment().format()} ${req.method} api/users${req.url} ${resp.type}`)
            res.status(400).send({ status: "ERROR", error: `${resp.type}` })
        }
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/users${req.url} ${err}`)
    }
})

routes.post("/documents", uploader.array("documentsImage", 3), async (req, res) => {
    try {
        if (!req.session.user) res.redirect("/views/login")

        await um.updateUsersDocuments(req.session.user._id, req.files)

        req.logger.info(`${moment().format()} ${req.method} api/users${req.url}`)
        res.status(200).send({ status: 'OK', payload: 'Imágenes subidas', files: req.files });
    } catch (err) {
        req.logger.error(`${moment().format()} ${req.method} api/users${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err.message })
    }
})

routes.post("/profilepics", uploader.single("documentsImage"), async (req, res) => {
    try {
        req.logger.info(`${moment().format()} ${req.method} api/users${req.url}`)
        res.status(200).send({ status: 'OK', payload: 'Imágenes subidas', files: req.file });
    } catch (err) {
        req.logger.error(`${moment().format()} ${req.method} api/users${req.url} ${err}`)
        res.status(500).send({ status: "ERROR" })
    }
})

routes.post("/products", uploader.single("documentsImage"), async (req, res) => {
    try {
        req.logger.info(`${moment().format()} ${req.method} api/users${req.url}`)
        res.status(200).send({ status: 'OK', payload: 'Imágenes subidas', files: req.file });
    } catch (err) {
        req.logger.error(`${moment().format()} ${req.method} api/users${req.url} ${err}`)
        res.status(500).send({ status: "ERROR" })
    }
})

routes.put("/:cid", verifyToken, filterAuth(["admin"]), async (req, res) => {
    const id = req.params.cid
    console.log(req.body)
    const { firstName, lastName, email, role } = req.body
    let resp = undefined
    try {
        resp = await um.updateUserByAdmin(id, firstName, lastName, email, role)
        if (resp.status === "OK") {
            req.logger.info(`${new moment().format()} ${req.method} api/users${req.url}`)
            res.status(200).send({ status: `El usuario con ID ${id} ha sido actualizado exitosamente` })
        } else if (resp.status === "ERROR") {
            req.logger.error(`${new moment().format()} ${req.method} api/users${req.url} ${resp.type.name}`)
            throw new Error(`No existe un usuario con el ID: ${id}`)
        }
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/users${req.url} ${err}`)
        res.status(400).send({ status: "ERROR", type: `${err}` })
    }
    // FileSystem
    // resp ?
    // res.status(200).send({ status: `El producto con ID ${productId} ha sido actualizado exitosamente` }) :
    // res.status(400).send({ ERROR: `El producto con ID ${productId} no existe.` })
})

routes.put("/premium/:uid", filterAuth(["premium"]), async (req, res) => {
    const uid = req.params.uid
    try {
        const resp = await um.updateUser(uid)
        if (resp.status === "OK") {
            req.logger.info(`${moment().format()} ${req.method} api/users${req.url}`)
            res.status(200).send({ status: "OK", payload: resp.payload })
        } else {
            throw new Error(`${resp.type}`)
        }
    } catch (err) {
        req.logger.error(`${moment().format()} ${req.method} api/users${req.url} ${err}`)
        res.status(500).send({ status: "ERROR", type: err.message })
    }
})

routes.delete("/:uid", verifyToken, filterAuth(["admin"]), async (req, res) => {
    const id = req.params.uid
    try {
        const resp = await um.deleteUserbyId(id)
        if (resp.status === "OK") {
            res.status(200).send({ status: "OK", payload: `El usuario con ID ${id} ha sido eliminado exitosamente` })
            req.logger.info(`${new moment().format()} ${req.method} api/products${req.url}`)
        } else if (resp.status === "ERROR") {
            req.logger.error(`${new moment().format()} ${req.method} api/products${req.url}`)
            throw new Error(`El usuario con ID ${id} no existe.`)
        }
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/products${req.url} ${err}`)
        res.status(400).send({ status: "ERROR", type: `${err.message}` })
    }
})


export default routes