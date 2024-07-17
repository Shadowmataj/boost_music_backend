import { UsersServices } from "../services/users.dao.mdb.js"

const us = new UsersServices()

export class usersManagers {

    async usersDTO (user){
            const { password, ...filteredUser } = user
            return filteredUser
    }

    async addUser(firstName, lastName, email, age, password) {
        try {
            const resp = await us.addUserService(firstName, lastName, email, age, password)
            return resp
        } catch (err) {
            console.log(`Function addUser: ${err}`)
        }
    }

    async findUser(options) {
        try {
            const resp = await us.findUserService(options)
            return resp
        } catch (err) {
            console.log(`Function findUser: ${err}`)
        }
    }

}
