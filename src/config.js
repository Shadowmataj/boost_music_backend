import { Command } from "commander"
import * as url from "url"


// Parseo de opciones de línea de comandos
// const commandLine = new Command()
// commandLine
//     .option("--mode <mode>")
//     .option("--port <port>")
//     .option("--setup <setup_number>")
// commandLine.parse()
// const clOptions = commandLine.opts()


// Parseo de variables de entorno
// Dotenv busca el archivo .env  e inyecta todas las variables en el entorno del sistema 
// Disponibles a través de process.env
// dotenv.config()

const config = {
    SERVER: "Atlas",
    PORT: process.env.PORT || 8080,
    DIRNAME: url.fileURLToPath(new URL(".", import.meta.url)),
    // función getter
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    THIS_PATH_PRODUCTS: "./src/dao/MangersFileSystem/products.json",
    THIS_PATH_CARTS: "./src/dao/MangersFileSystem/carts.json",
    MONGODB_URI: process.env.MONGODB_URI,
    SECRET: process.env.SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALL_BACK: process.env.GITHUB_CALL_BACK,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALL_BACK: process.env.GITHUB_CALL_BACK,
    PERSISTENCE: process.env.PERSISTENCE,
    GMAIL_MAIL: process.env.GMAIL_MAIL,
    GMAIL_APP_PASS: process.env.GMAIL_APP_PASS,
    TWILIO_SID: process.env.TWILIO_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
}

export default config