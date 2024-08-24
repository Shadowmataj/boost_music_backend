import moment from "moment"
import nodemailer from "nodemailer"

import config, { errorsDictionary } from "../config.js"
import CartsManagers from "../controller/carts.manager.js"
import recoveryModel from "../models/recovery.models.js"
import usersModel from "../models/users.model.js"
import CustomError from "./customError.class.js"
import { createHash, isValidPassword } from "./utils.js"

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
            if(user.role === "user") user.role = "premium"
            else if(user.role === "premium") user.role = "user"
            await usersModel.findByIdAndUpdate(uid, {role: user.role})
            return {status: "OK", payload: "El rol ha sido actualizado."}
        } catch (err) {
            return { status: "ERROR", type: err.message }
        }
    }
}
