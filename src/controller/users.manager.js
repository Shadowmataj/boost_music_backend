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

    async userPasswordRecovery(email) {
        try {
            const resp = await us.userPasswordRecoveryService(email)
            return resp
        } catch (err) {
            console.log(`Function userPasswordRecovery: ${err}`)
        }
    }

    async userPasswordChange(prid, newPassword) {
        try {
            const resp = await us.userPasswordChangeService(prid, newPassword)
            return resp
        } catch (err) {
            console.log(`Function userPasswordChange: ${err}`)
        }
    }

    async updateUser(uid) {
        try {
            const resp = await us.updateUserService(uid)
            return resp
        } catch (err) {
            console.log(`Function updateUser: ${err}`)
        }
    }

}
