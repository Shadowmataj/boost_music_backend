import express from "express"
import config from "./config.js"
import cartRoutes from "./routes/cart.routes.js"
import productsRoutes from "./routes/products.routes.js"
import handlebars from "express-handlebars"
import viewRoutes from "./routes/view.routes.js"
import { Server } from "socket.io"
import fs from "fs"


const app = express()

//handlebars configuration
app.engine("handlebars", handlebars.engine())
app.set("views", `${config.DIRNAME}/views`)
app.set("view engine", "handlebars")


app.use(express.json())
app.use(express.urlencoded({extended: true}))

// end points configuration
app.use("/api/products/", productsRoutes)
app.use("/api/carts/", cartRoutes)
app.use("/views/", viewRoutes)
// access to static content
app.use('/static', express.static(`${config.DIRNAME}/public`));


const httpServer = app.listen(config.PORT, ()=> console.log(`Hola, servidor arriba en el puerto ${config.PORT}`))

const socketServer = new Server(httpServer)

// stablish this variable to use it on another module
app.set("socketServer", socketServer)

// listening the connection from a new socket
socketServer.on("connection", socket => {
    console.log(`Nuevo cliente conectado ${socket.id}`)
    // the first contact between client and server
    socket.on("handshake", data => {
        console.log(data)
    })
    // every time there's an update on the db, the client receives the information updates
    socket.on("update_db", data => {
        console.log(data)
        const productsList = JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS)) 
        socketServer.emit("update_for_all", productsList )
    })
})
