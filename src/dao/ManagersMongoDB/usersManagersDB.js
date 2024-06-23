import usersModel from "../models/users.model.js"
import usersCompleteModel from "../models/users_complete.model copy.js"
import cartModel from "../models/cart.models.js"
import moment from "moment"

export class usersManagers {

    async addUser(firstName, lastName, email, password) {
        try {
            const userInfo = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            }

            const userExists = await usersModel.exists({ email: email })
            if (userExists) throw "El usuario ya está registrado."
            await usersModel.create(userInfo)
            return { status: "OK", payload: "El usuario ha sido agregado exitosamente." }
        } catch (err) {
            console.log(err)
            return { status: "ERROR", type: err }
        }
    }

    async addUserComplete(firstName, lastName, email, age, password) {
        try {
            const userInfo = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                age: age,
                password: password
            }

            const date = moment().format()
            const item = {
                products: [],
                date: date
            }

            const newCart = await cartModel.create(item)
            userInfo["cart"] = newCart._id
            const userExists = await usersCompleteModel.exists({ email: email })
            if (userExists) throw "El usuario ya está registrado."
            await usersCompleteModel.create(userInfo)
            return { status: "OK", payload: "El usuario ha sido agregado exitosamente." }
        } catch (err) {
            console.log(err)
            return { status: "ERROR", type: err }
        }
    }

    async findUser(options) {

        try {
            const user = await usersModel.find(options).lean()
            return user[0]

        } catch (err) {
            console.log(`${err}`)
        }
    }

    async findUserComplete(options) {

        try {
            const user = await usersCompleteModel.find(options).lean()
            return user[0]

        } catch (err) {
            console.log(`${err}`)
        }
    }
}
