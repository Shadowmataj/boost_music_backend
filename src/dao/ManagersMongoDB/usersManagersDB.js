import usersModel from "../models/users.model.js"

export class usersManagers {
    
    async addUser(firstName, lastName, email, password) {
        try{
            const userInfo = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            }
            
            const userExists = await usersModel.exists({email: email})
            if(userExists) throw "El usuario ya está registrado."
            await usersModel.create(userInfo)
            return { status: "OK", payload: "El usuario ha sido agregado exitosamente." }
        }catch (err){
            console.log(err)
            return { status: "ERROR", type: err }
        }
    }
    

    async findUser (userEmail){

        try{
            const options = { email: userEmail}
            const user = await usersModel.find(options).lean()
            return user[0]

        } catch (err){
            console.log(`${err}`)
        }
    }
}
