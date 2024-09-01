import { UsersServices } from "../services/users.dao.mdb.js"
// import { UsersServices } from "../services/dao.factory.js"

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
            console.log(uid)
            const resp = await us.updateUserService(uid)
            return resp
        } catch (err) {
            console.log(`Function updateUser: ${err}`)
        }
    }

    async updateLastLogin(uid, log) {
        try {
            await us.updateLastLoginService(uid, log)
            return true
        } catch (err) {
            console.log(`Function updateLastLogin: ${err}`)
        }
    }

    async updateUsersDocuments(uid, files) {
        try {
            await us.updateUsersDocumentsService(uid, files)
            return true
        } catch (err) {
            console.log(`Function updateLastLogin: ${err}`)
        }
    }

}
