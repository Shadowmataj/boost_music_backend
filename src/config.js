import * as url from "url"
import path from "path"

const config = {
    SERVER: "Atlas",
    PORT: process.env.PORT || 8080,
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')),
    // función getter
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    get UPLOAD_DOCUMENTS_DIR() { return `${this.DIRNAME}/uploads` },
    THIS_PATH_PRODUCTS: "./src/dao/MangersFileSystem/products.json",
    THIS_PATH_CARTS: "./src/dao/MangersFileSystem/carts.json",
    APP_NAME: "boost",
    MONGODB_URI: process.env.MONGODB_URI,
    SECRET: process.env.SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALL_BACK: process.env.GITHUB_CALL_BACK,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALL_BACK: process.env.GOOGLE_CALL_BACK,
    PERSISTENCE: process.env.PERSISTENCE,
    GMAIL_MAIL: process.env.GMAIL_MAIL,
    GMAIL_APP_PASS: process.env.GMAIL_APP_PASS,
    TWILIO_SID: process.env.TWILIO_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    MODE: process.env.MODE
}



export const errorsDictionary = {
    UNHANDLED_ERROR: {code: 0, status: 500, message: "Error no identificado."},
    ROUTING_ERROR: {code: 1, status: 404, message: "No se encuentra el endpoint solicitado."},
    FEW_PARAMETERS: {code: 2, status: 400, message: "Faltan parámetros obligatorios."},
    INVALID_MONGOID_FORMAT: {code: 3, status: 400, message: "El ID no contiene un formato válido."},
    INVALID_PARAMETER: {code: 4, status: 400, message: "El parámetro ingresado no es válido."},
    INVALID_TYPE_ERROR: {code: 5, status: 400, message: "No corresponde el tipo de dato."},
    ID_NOT_FOUND: {code: 6, status: 400, message: "No existe registro con ese ID."},
    PAGE_NOT_FOUND: {code: 7, status: 404, message: "No se encuentra la página solicitada."},
    DATABASE_ERROR: {code: 8, status: 500, message: "No se puede conectar a la base de datos."},
    INTERNAL_ERROR: {code: 9, status: 500, message: "Error interno de ejecución del servidor."},
    RECORD_CREATION_ERROR: {code: 10, status: 500, message: "Error al intentar crear el registro."},
    RECORD_CREATION_OK: {code: 11, status: 200, message: "Registro creado."},
    AUTH_ERROR: {code: 12, status: 401, message: "Permisos insuficientes."},
    CART_PRODUCT_ERROR: {code: 13, status: 400, message: "El producto no se encuentra en el carrito."},
    EMPTY_CART_ERROR: {code: 14, status: 400, message: "El carrito de compra está vacío."},
    USER_CREATION_ERROR: {code: 15, status: 400, message: "El usuario ya está registrado."},
}



export default config