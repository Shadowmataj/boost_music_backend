import * as url from "url"

const config = {
    SERVER: "Atlas",
    PORT: 8080,
    DIRNAME: url.fileURLToPath(new URL(".", import.meta.url)),
    // función getter
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    THIS_PATH_PRODUCTS: "./src/dao/MangersFileSystem/products.json",
    THIS_PATH_CARTS: "./src/dao/MangersFileSystem/cart.json",
    MONGODB_URI: "mongodb+srv://Lap_Chris:lrUmfKk7aUZspkGU@clustercoder.ofedtoa.mongodb.net/boost_music",
    SECRET: "boostmusicgear_j032990jfioas",
    GITHUB_CLIENT_ID: "Iv23lihwlOTeu1NsV80I",
    GITHUB_CLIENT_SECRET: "6fbd12d060db12097a99dad5703285e0701358e2",
    GITHUB_CALL_BACK: "http://localhost:8080/sessions/ghlogincallback",
    GOOGLE_CLIENT_ID: "50307290449-jufolb5bi5f0qs8mmugv75fsgke5jpar.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET: "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",
    GOOGLE_CALL_BACK: "http://localhost:8080/sessions/gglogincallback"
}

export default config