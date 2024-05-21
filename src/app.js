import express from "express"
import config from "./config.js"
import cartRoutes from "./routes/cart.routes.js"
import productsRoutes from "./routes/products.routes.js"
import artistsRoutes from "./routes/artists.routes.js"
import commentsRoutes from "./routes/comments.routes.js"
import brandsRoutes from "./routes/brands.routes.js"
import handlebars from "express-handlebars"
import viewRoutes from "./routes/view.routes.js"
import { Server } from "socket.io"
import mongoose from "mongoose"
import mesagesModel from "./dao/models/messages.models.js"
import fs from "fs"


const app = express()
const httpServer = app.listen(config.PORT, async()=> {
    await mongoose.connect(config.MONGODB_URI)
    console.log(`App activa en el puerto ${config.PORT}, enlazada a la base de datos.`)
})
const socketServer = new Server(httpServer)
// stablish this variable to use it on another module
app.set("socketServer", socketServer)

//handlebars configuration
app.engine("handlebars", handlebars.engine())
app.set("views", `${config.DIRNAME}/views`)
app.set("view engine", "handlebars")


app.use(express.json())
app.use(express.urlencoded({extended: true}))

// end points configuration
app.use("/api/products", productsRoutes)
app.use("/api/carts", cartRoutes)
app.use("/api/artists", artistsRoutes)
app.use("/api/comments", commentsRoutes)
app.use("/api/brands", brandsRoutes)
app.use("/views", viewRoutes)
// access to static content
app.use('/static', express.static(`${config.DIRNAME}/public`));




// listening the connection from a new socket
socketServer.on("connection", socket => {
    console.log(`Nuevo cliente conectado ${socket.id}`)
    // the first contact between client and server
    socket.on("handshake", data => {
        console.log(data)
    })

    socket.on("newMessage",async data => {
        try{
            mesagesModel.insertMany(data)
            socket.broadcast.emit("updateChat", data)
        } catch(err){
            console.log(`${err}`)
        }
    })
})
