import cors from "cors"
import express from "express"
import handlebars from "express-handlebars"
import session from "express-session"
import mongoose from "mongoose"
import passport from "passport"
import fileStore from "session-file-store"
import { Server } from "socket.io"
import config from "./config.js"
import cartsModel from "./models/cart.models.js"
import mesagesModel from "./models/messages.models.js"
import productModels from "./models/products.models.js"
import artistsRoutes from "./routes/artists.routes.js"
import brandsRoutes from "./routes/brands.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import commentsRoutes from "./routes/comments.routes.js"
import productsRoutes from "./routes/products.routes.js"
import sessionsRoutes from "./routes/sessions.routes.js"
import viewRoutes from "./routes/view.routes.js"

const app = express()
const fileStorage = fileStore(session)
const httpServer = app.listen(config.PORT, async () => {
    
    console.log(`App activa en el puerto ${config.PORT}, enlazada a la base de datos. PID: ${process.pid}`)
})

await mongoose.connect(config.MONGODB_URI)

const socketServer = new Server(httpServer)
// stablish this variable to use it on another module
app.set("socketServer", socketServer)

//handlebars configuration
app.engine("handlebars", handlebars.engine())
app.set("views", `${config.DIRNAME}/views`)
app.set("view engine", "handlebars")


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: '*' }));

// using express-sesion to handle users acces
app.use(session({
    store: new fileStorage({ path: "./sessions", ttl: 100, retries: 0 }),
    secret: config.SECRET,
    resave: true,
    saveUninitialized: true 
}))


app.use(passport.initialize())
app.use(passport.session())

// end points configuration
app.use("/api/products", productsRoutes)
app.use("/api/carts", cartRoutes)
app.use("/api/artists", artistsRoutes)
app.use("/api/comments", commentsRoutes)
app.use("/api/brands", brandsRoutes)
app.use("/views", viewRoutes)
app.use("/sessions", sessionsRoutes)
// access to static content
app.use('/static', express.static(`${config.DIRNAME}/public`));




// listening the connection from a new socket
socketServer.on("connection", socket => {
    console.log(`Nuevo cliente conectado ${socket.id}`)
    // the first contact between client and server
    socket.on("handshake", data => {
        console.log(data)
    })

    socket.on("newMessage", async data => {
        try {
            mesagesModel.insertMany(data)
            socket.broadcast.emit("updateChat", data)
        } catch (err) {
            console.log(`${err}`)
        }
    })

    socket.on("addProduct", async data => {
        try {
            const cart = await cartsModel.findById(data.cid)
            const cartProducts = [...cart.products]

            await productModels.exists({ _id: data.pid })
            const productIndex = cartProducts.findIndex(itm => itm.id === data.pid)
            if (productIndex !== -1) {
                cartProducts[productIndex].quantity = cartProducts[productIndex].quantity + 1
            } else {
                const newItem = {
                    id: data.pid,
                    quantity: 1
                }
                cartProducts.push(newItem)
            }

            await cartsModel.findByIdAndUpdate(data.cid, { products: cartProducts })
            socket.emit("productAdded", {status: "El producto se ha agregado al carrito."})    
        } catch (err) {
            console.log(`${err}`)
            socket.emit("productNotAdded", {status: "El producto no se ha podido agregar al carrito."})
        }
    })
})
