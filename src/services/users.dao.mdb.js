import moment from "moment"
import cartModel from "../models/cart.models.js"
import usersModel from "../models/users.model.js"
import { CartsManagers } from "../controller/carts.manager.js"
import CustomError from "./customError.class.js"
import { errorsDictionary } from "../config.js"

const cm = new CartsManagers()

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
           return {status: "ERROR", type: err.message}
        }
    }

}
