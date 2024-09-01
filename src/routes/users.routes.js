import { Router } from "express";
import moment from "moment";

import { usersManagers } from "../controller/users.manager.js";
import { filterAuth } from "../services/utils.js";
import { uploader } from "../services/uploader.js";

const routes = Router()
const um = new usersManagers()

routes.post("/documents", uploader.array("documentsImage",3), async (req, res) => {
    try {
        if(!req.session.user) res.redirect("/views/login")

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

routes.put("/premium/:uid", filterAuth(["premium"]), async (req, res) => {
    const uid = req.params.uid
    try {
        const resp = await um.updateUser(uid)
        if (resp.status === "OK"){
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


export default routes