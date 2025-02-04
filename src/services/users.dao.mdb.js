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

    /**
     * Method to get an specific user.
     * @param {string} pid The db user id.
     * @returns The status and the user.
     */
    async getUsersByIdService(pid) {

        try {
            const user = await usersModel.findById(pid) //get the user.
            return { status: "OK", payload: user } //return the status and user.

        } catch (err) {
            return { status: "ERROR", type: err } //return error.
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

    /**
     * Method to create users.
     * @param {string} firstName The new user name.
     * @param {string} lastName The new user's last name.
     * @param {string} email The new users's email.
     * @param {string} age The new user's age.
     * @param {string} password The new user's password
     * @returns The status.
     */
    async addUserService(firstName, lastName, email, age, password) {
        try {
            const userInfo = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                age: age,
                password: password
            } //create an object with the new user info.


            const userExists = await usersModel.exists({ email: email }) //check if the user exists in the db.
            if (userExists) throw new CustomError(errorsDictionary.USER_CREATION_ERROR) //if exists, throw custom error.
            const newCart = await cm.addCart([]) //creates a cart for the user.
            userInfo["cart"] = newCart._id //add the new cart id to the user info object.
            await usersModel.create(userInfo) //create the user.
            return { status: "OK", payload: "El usuario ha sido agregado exitosamente." } //return the status and a description.
        } catch (err) {
            return { status: "ERROR", type: err.type } //return error
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

    /**
     * Method to create the user's password change id (handlebars).
     * @param {*} email The user's email.
     * @returns The status.
     */
    async userPasswordRecoveryService(email) {

        try {
            const user = await usersModel.find({ email: email }).lean()
            //if the user exists send an email to change the password.
            if (user) {
                const expirationDate = moment()
                const recoveryId = await recoveryModel.create({ email: email, expirationDate: expirationDate }) //create the recovery info in db.

                let confirmation = await transport.sendMail({
                    from: config.GMAIL_MAIL,
                    to: email,
                    subject: "Cambio de contraseña",
                    html: `
                    <h1>Te enviamos el link para reestablecer tu contraseña:</h1>
                    <a href ="http://localhost:8080/views/passwordchange/${recoveryId._id}">Cambio de contraseña</a>
                    `
                }) //email to send.
            } else return { status: "ERROR", type: "El usuario no está registrado." } //return status.
        } catch (err) {
            return { status: "ERROR", type: err.message } //return error.
        }
    }

    /**
     * Method to change the password.
     * @param {string} prid The db recovery id. 
     * @param {string} newPassword The password to update.
     * @returns The status and a description.
     */
    async userPasswordChangeService(prid, newPassword) {

        try {
            const recovery = await recoveryModel.findById(prid).lean() //get the recovery object.
            if (!recovery) return { status: "ERROR", type: "La solicitud es inválida." } //if there's no recovery object, return error.
            const user = await usersModel.find({ email: recovery.email }).lean() //get the user.
            const user1 = user[0]
            if (!user1) return { status: "ERROR", type: "El usuario no existe." } //if the user does not exist, return an error.
            const today = moment() //get the current date.
            if (today.diff(recovery.expirationDate, "seconds") < 3600 && recovery.status === true) { //if the request time is up to 1h and status true
                if (!isValidPassword(user1, newPassword)) {  //if the password is not equal to the last one.
                    const passwordChanged = createHash(newPassword) //create the new password hash.
                    await usersModel.findByIdAndUpdate(user1._id, { password: passwordChanged }) //update the password.
                    await recoveryModel.findByIdAndUpdate(prid, { status: false }) //disable the recovery in db.
                } else return { status: "ERROR", type: "La contraseña no puede ser igual a la anterior." } //if the password is equal to the last one, return error.
            } else {
                await recoveryModel.findByIdAndUpdate(prid, { status: false }) //if the change is made after 1h the request was created 
                return { status: "ERROR", type: "No es posible concretar la solicitud debido a que excede el tiempo permitido o ya se ha realizado el cambio." } //return error and description.
            }
            return { status: "OK", payload: "La contraseña ha sido actualizada." } // return the status and descrptions.
        } catch (err) {
            return { status: "ERROR", type: err.message } //return status and error message.
        }
    }

    /**
     * Method to update a user (handlebars).
     * @param {string} uid The mongo user id.
     * @returns The status.
     */
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

    /**
     * Method to update the user's last login.
     * @param {string} uid The user's id.
     * @param {string} log The last login log information.
     * @returns 
     */
    async updateLastLoginService(uid, log) {
        try {
            await usersModel.findByIdAndUpdate(uid, { lastConnection: `${moment().format()}-${log}` }) //update user's the lastConnection  
            return true
        } catch (err) {
            console.log(err.message) //show error in console.
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

    /**
     * Method to update an specific user (admin only).
     * @param {string} id The user's id. 
     * @param {string} firstName The user's first name to update.
     * @param {string} lastName The user's last name to update.
     * @param {string} email The user's email to update.
     * @param {string} role The user's role to update.
     * @returns The status and description.
     */
    async updateUserByAdminService(id, firstName, lastName, email, role) {

        try {
            const user = await usersModel.findByIdAndUpdate(id, { firstName: firstName, lastName: lastName, email: email, role: role }) //update the user.
            return { status: "OK", payload: "Actualizado" } //return status.
        } catch (err) {
            return { status: "ERROR", type: err } //return error.
        }
    }

    /**
     * Method to delete users depending on their last time connection.
     * @returns The status.
     */
    async deleteUserbyTimeService() {

        try {
            const users = await usersModel.find({_id: {$ne: null}}) //get all users.
        
            users.forEach( async(user) => {
                if(user.lastConnection){
                    const date = moment(user.lastConnection.split("-LOG")[0]) //convert to a moment object the last time connection.
                    const today = moment(moment().format()) //get the current moment.
                    const difference = today.diff(date, "days", true) //calculate the difference between last connection and today in days.
                    if(difference > 3){ //if the difference is grater than 3 days
                        await usersModel.findByIdAndDelete(user._id) //The user is delete from db.
                    }
                }
            })
            return { status: "OK", payload: "Se ha completado la operación." } //return status and description.
        } catch (err) {
            return { status: "ERROR", type: err } //return error.
        }
    }

    /**
     * Method to erase an user.
     * @param {string} uid The mongo user id.
     * @returns The status and description.
     */
    async deleteUserbyIdService(uid) {

        try {
            await usersModel.findByIdAndDelete(uid) //delete the user.
            return { status: "OK", payload: "El usuario ha sido eliminado." } //return status and description.
        } catch (err) {
            return { status: "ERROR", type: err } //return error.
        }
    }
}
