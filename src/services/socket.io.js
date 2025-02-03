
const socketServer = app.get("socketServer")
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
            socket.emit("productAdded", { status: "El producto se ha agregado al carrito." })
        } catch (err) {
            console.log(`${err}`)
            socket.emit("productNotAdded", { status: "El producto no se ha podido agregar al carrito." })
        }
    })
})