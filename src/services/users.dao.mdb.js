import moment from "moment"
import nodemailer from "nodemailer"

import config, { errorsDictionary } from "../config.js"
import CartsManagers from "../controller/carts.manager.js"
import recoveryModel from "../models/recovery.models.js"
import usersModel from "../models/users.model.js"
import CustomError from "./customError.class.js"
import { createHash, isValidPassword } from "./utils.js"
import { format } from "winston"

const cm = new CartsManagers()
const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: config.GMAIL_MAIL,
        pass: config.GMAIL_APP_PASS
    }
})


export class UsersServices {

    async getUsersByIdService(pid) {

        try {
            const user = await usersModel.findById(pid)
            return { status: "OK", payload: user }

        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

    async getUsersService(limitUsers, pageNumber, sortUsers) {
        try {
            let link = `http://localhost:${config.PORT}/api/users?limit=${limitUsers}`

            const options = { page: pageNumber, limit: limitUsers }

            if (sortUsers === 1 || sortUsers === -1) {
                options["sort"] = { price: sortUsers }
                link = `${link}&sort=${sortUsers}`
            }

            const users = await usersModel.paginate(
                { _id: { $ne: undefined } }, options)


            if (users.docs.length === 0) throw new CustomError(errorsDictionary.INVALID_PARAMETER)

            const filteredUsers = users.docs.map(user => {
                return ({
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                })
            })

            const result = { status: "OK", payload: filteredUsers, totalPages: users.totalPages, prevPage: users.prevPage, nextPage: users.nextPage, page: users.page, hasPrevPage: users.hasPrevPage, hasNextPage: users.hasNextPage }

            if (users.hasPrevPage === false) result["prevLink"] = null
            else {
                result["prevLink"] = `${link}&page=${pageNumber - 1}`
            }
            if (users.hasNextPage === false) result["nextLink"] = null
            else {
                result["nextLink"] = `${link}&page=${pageNumber + 1}`
            }
            return result
        } catch (err) {
            return { status: "ERROR", type: err.message }
        }
    }

    async addUserService(firstName, lastName, email, age, password) {
        try {
            const userInfo = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                age: age,
                password: password
            }


            const userExists = await usersModel.exists({ email: email })
            if (userExists) throw new CustomError(errorsDictionary.USER_CREATION_ERROR)
            const newCart = await cm.addCart([])
            userInfo["cart"] = newCart._id
            await usersModel.create(userInfo)
            return { status: "OK", payload: "El usuario ha sido agregado exitosamente." }
        } catch (err) {
            return { status: "ERROR", type: err.type }
        }
    }

    async findUserService(options) {

        try {
            const user = await usersModel.find(options).lean()
            return user[0]

        } catch (err) {
            return { status: "ERROR", type: err.message }
        }
    }

    async userPasswordRecoveryService(email) {

        try {
            const user = await usersModel.find({ email: email }).lean()
            if (user) {

                const expirationDate = moment()
                const recoveryId = await recoveryModel.create({ email: email, expirationDate: expirationDate })

                let confirmation = await transport.sendMail({
                    from: config.GMAIL_MAIL,
                    to: email,
                    subject: "Cambio de contraseña",
                    html: `
                    <h1>Te enviamos el link para reestablecer tu contraseña:</h1>
                    <a href ="http://localhost:8080/views/passwordchange/${recoveryId._id}">Cambio de contraseña</a>
                    `
                })
            } else return { status: "ERROR", type: "El usuario no está registrado." }
        } catch (err) {
            return { status: "ERROR", type: err.message }
        }
    }

    async userPasswordChangeService(prid, newPassword) {

        try {
            const recovery = await recoveryModel.findById(prid).lean()
            if (!recovery) return { status: "ERROR", type: "La solicitud es inválida." }
            const user = await usersModel.find({ email: recovery.email }).lean()
            const user1 = user[0]
            if (!user1) return { status: "ERROR", type: "El usuario no existe." }
            const today = moment()
            if (today.diff(recovery.expirationDate, "seconds") < 3600 && recovery.status === true) {
                if (!isValidPassword(user1, newPassword)) {
                    const passwordChanged = createHash(newPassword)
                    await usersModel.findByIdAndUpdate(user1._id, { password: passwordChanged })
                    await recoveryModel.findByIdAndUpdate(prid, { status: false })
                } else return { status: "ERROR", type: "La contraseña no puede ser igual a la anterior." }
            } else {
                await recoveryModel.findByIdAndUpdate(prid, { status: false })
                return { status: "ERROR", type: "No es posible concretar la solicitud debido a que excede el tiempo permitido o ya se ha realizado el cambio." }
            }
            return { status: "OK", payload: "La contraseña ha sido actualizada." }
        } catch (err) {
            return { status: "ERROR", type: err.message }
        }
    }

    async updateUserService(uid) {

        try {
            const user = await usersModel.findById(uid)
            if (user.documents.length === 3 && user.role === "user") {
                if (user.documents[0].name.includes("IDENTIFICACION") && user.documents[1].name.includes("COMPROBANTEDEDOMICILIO") && user.documents[2].name.includes("ESTADODECUENTA")) {
                    await usersModel.findByIdAndUpdate(uid, { role: "premium" })
                    return { status: "OK", payload: "Se ha realizado el cambio solicitado." }
                } else {
                    throw new Error("Alguno de los documentos no cumple con lo solicitado.")
                }
            } else if (user.role === "premium") {
                await usersModel.findByIdAndUpdate(uid, { role: "user" })
                return { status: "OK", payload: "Se ha realizado el cambio solicitado." }
            } else if (user.documents.length < 3 && user.documents.length > 0) throw new Error("Faltan documentos.")
            else if (user.documents.length > 3) throw new Error("Hay más documentos de los solicitados.")
            else if (user.documents.length === 0) throw new Error("No se han cargado los documentos necesarios.")
        } catch (err) {
            return { status: "ERROR", type: err.message }
        }
    }

    async updateLastLoginService(uid, log) {
        try {
            await usersModel.findByIdAndUpdate(uid, { lastConnection: `${moment().format()}-${log}` })
            return true
        } catch (err) {
            console.log(err.message)
        }
    }

    async updateUsersDocumentsService(uid, files) {
        try {
            const documents = files.map(item => {
                const newItem = {
                    name: item.filename,
                    reference: item.path
                }
                return newItem
            })

            await usersModel.findByIdAndUpdate(uid, { documents: documents })

            console.log(documents)

            return true
        } catch (err) {
            console.log(err.message)
        }
    }

    async updateUserByAdminService(id, firstName, lastName, email, role) {

        try {
            const user = await usersModel.findByIdAndUpdate(id, { firstName: firstName, lastName: lastName, email: email, role: role })
            return { status: "OK", payload: "Actualizado" }
        } catch (err) {
            console.log(err.message)
            return { status: "ERROR", type: err }
        }
    }

    async deleteUserbyTimeService() {

        try {
            const users = await usersModel.find({_id: {$ne: null}})
        
            users.forEach( async(user) => {
                if(user.lastConnection){
                    const date = moment(user.lastConnection.split("-LOG")[0])
                    const today = moment(moment().format())
                    const difference = today.diff(date, "days", true)
                    if(difference > 3){
                        console.log(user._id)
                        await usersModel.findByIdAndDelete(user._id)
                    }
                }
            })
            return { status: "OK", payload: "Se ha completado la operación." }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

    async deleteUserbyIdService(uid) {

        try {
            await usersModel.findByIdAndDelete(uid)
            return { status: "OK", payload: "El usuario ha sido eliminado." }
        } catch (err) {
            console.log(err.message)
            return { status: "ERROR", type: err }
        }
    }
}
