import express from "express"
import config from "./config.js"
import cartRoutes from "./routes/cart.routes.js"
import productsRoutes from "./routes/products.routes.js"


const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/api/products/", productsRoutes)
app.use("/api/carts/", cartRoutes)

app.listen(config.PORT, ()=> console.log("Hola, servidor arriba en el puerto 8080"))