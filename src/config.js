import * as url from "url"

const config = {
    SERVER: "Atlas",
    PORT: 8080,
    DIRNAME: url.fileURLToPath(new URL(".", import.meta.url)),
    // función getter
    get UPLOAD_DIR(){ return `${this.DIRNAME}/public/img`},
    THIS_PATH_PRODUCTS: "./src/dao/MangersFileSystem/products.json",
    THIS_PATH_CARTS: "./src/dao/MangersFileSystem/cart.json",
    MONGODB_URI: "mongodb+srv://Lap_Chris:lrUmfKk7aUZspkGU@clustercoder.ofedtoa.mongodb.net/boost_music",
    SECRET: "boostmusicgear_j032990jfioas"
}

export default config