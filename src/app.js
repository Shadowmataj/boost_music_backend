import cluster from "cluster"
import cors from "cors"
import express from "express"
import handlebars from "express-handlebars"
import session from "express-session"
import passport from "passport"
import fileStore from "session-file-store"
import { Server } from "socket.io"
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUiExpress from 'swagger-ui-express'

import { cpus } from "os"
import config from "./config.js"
import artistsRoutes from "./routes/artists.routes.js"
import authRoutes from "./routes/auth.routes.js"
import brandsRoutes from "./routes/brands.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import commentsRoutes from "./routes/comments.routes.js"
import loggerRoutes from "./routes/logger.routes.js"
import productsRoutes from "./routes/products.routes.js"
import usersRoutes from "./routes/users.routes.js"
import viewRoutes from "./routes/view.routes.js"
import errorsHandler from "./services/errors.handler.js"
import addLogger from "./services/logger.js"

//Checking if the process is a primary.
if (cluster.isPrimary) {
    // initializing 8 instances cluster 
    for (let i = 0; i < cpus().length; i++) cluster.fork()
        
    // Identify if a worker process has an error.
    cluster.on('error', (err) => {
        console.error('Child process encountered an error:', err);
    });

    // If the a worker process fails, it spawn a new worker process. 
    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
        cluster.fork()
    })
} else {
    try {
        //Create the aplication.
        const app = express()
        
        console.log("Persistencia a MONGO")
        const { default: MongoSingleton } = await import("./services/mongo.singleton.js")
        await MongoSingleton.getInstance()
        
        //Binds and listens for connections on the specified host and port. This method is identical to Node’s http.Server.listen().
        const httpServer = app.listen(config.PORT, async () => {
            console.log(`App activa en el puerto ${config.PORT} (PID: ${process.pid})`)
        })
        //  Create an instance using socket.io.
        const socketServer = new Server(httpServer)
        // stablish this variable to use it on another module
        app.set("socketServer", socketServer)
        
        // Handlebars configuration
        app.engine("handlebars", handlebars.engine())
        app.set("views", `${config.DIRNAME}/views`)
        app.set("view engine", "handlebars")
        
        // Parse incoming requests with JSON payloads
        app.use(express.json())
        // Parse incoming requests with urlencoded payloads.
        app.use(express.urlencoded({ extended: true }))
        
        //
        const corsOptions = {
            origin: config.PAGE_LINK,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization', 'X-Request-With'],
        }
        app.use(cors(corsOptions));
        
        // using express-session to handle users acces
        const fileStorage = fileStore(session)
        app.use(session({
            store: new fileStorage({ path: "./sessions", ttl: 100, retries: 0 }),
            secret: config.SECRET,
            resave: true,
            saveUninitialized: true
        }))

        // Configure passport middleware, includes sessions.
        app.use(passport.initialize())
        app.use(passport.session())

        //Adding logger.
        app.use(addLogger)
        
        // End points configuration using router.
        app.use("/logger", loggerRoutes)
        app.use("/api/products", productsRoutes)
        app.use("/api/carts", cartRoutes)
        app.use("/api/artists", artistsRoutes)
        app.use("/api/comments", commentsRoutes)
        app.use("/api/brands", brandsRoutes)
        app.use("/views", viewRoutes)
        app.use("/auth", authRoutes)
        app.use("/api/users", usersRoutes)

        // Access to static content
        app.use('/static', express.static(`${config.DIRNAME}/public`));
        // Errors handler middleware: every request. 
        app.use(errorsHandler)

        //Setting api/docs endpoint using swagger.
        const swaggerOptions = {
            definition: {
                openapi: '3.1.0',
                info: {
                    title: 'Documentación sistema boost music',
                    description: 'Esta documentación cubre toda la API habilitada para Boost Music',
                },
            },
            apis: ['./src/docs/**/*.yaml'], // all the files about routes configuration will be here.
        };
        const specs = swaggerJsdoc(swaggerOptions);
        app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
    } catch (err) {
        console.log(`Backend: error al inicializar ${err.message}`)
    }
}

