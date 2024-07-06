import config from "../config.js";

let factoryProductService = {}

switch (config.PERSISTENCE) {

    case "fs":
        console.log("Persistencia a fs")
        const FsServices = await import("./products.dao.fs.js")
        factoryProductService = FsServices.default
        break
    case "mongo":
        console.log("Persistencia a MONGO")
        const { default: MongoSingleton } = await import("./mongo.singleton.js")
        await MongoSingleton.getInstance()
        const MongoService = await import("./products.dao.mdb.js")
        factoryProductService = MongoService.default
        break
    default:
        console.log(`Configuración ${config.PERSISTENCE} no soportada.`)

}

console.log(factoryProductService)