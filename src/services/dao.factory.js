import config from "../config.js";

export let ProductsServices = {}
export let CartsServices = {}
export let UsersServices = {}

switch (config.PERSISTENCE) {

    case "fs":
        console.log("Persistencia a fs")
        const FsServices = await import("./products.dao.fs.js")
        const FsServiceCarts = await import("./carts.dao.fs.js")
        ProductsServices = FsServices.default
        CartsServices = FsServiceCarts.default
        break
    case "mongo":
        console.log("Persistencia a MONGO")
        const { default: MongoSingleton } = await import("./mongo.singleton.js")
        await MongoSingleton.getInstance()

        const MongoService = await import("./products.dao.mdb.js")
        const MongoServiceCarts = await import("./carts.dao.mdb.js")
        const MongoServiceUsers = await import("./users.dao.mdb.js")
        UsersServices
        ProductsServices = MongoService.default
        CartsServices = MongoServiceCarts.default
        UsersServices = MongoServiceUsers.default
        break

    default:
        console.log(`Configuración ${config.PERSISTENCE} no soportada.`)

}

