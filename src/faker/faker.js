import { faker } from "@faker-js/faker"

export const generateFakeProducts = (qty) => {
    const products = []
    const CATEGORIES = ["Guitarra", "Bajo", "Ukulele", "Pedal", "Case", "Tali"]

    for (let i = 0; i < qty; i++) {
        const title = faker.commerce.productName()
        const description= faker.commerce.productDescription()
        const thumbnails= faker.image.urlPicsumPhotos()
        const price = faker.commerce.price({min: 10000, max: 100000, symbol: "$"})
        const category= CATEGORIES[Math.floor(Math.random()*CATEGORIES.length)]
        const stock = faker.number.int({min: 0, max: 10})
        const code= faker.string.nanoid(10)
        const status = faker.number.binary({length: 1})=== "1"? true : false

        products.push({title, description, thumbnails, price, category, stock, code, status})
    }

    return products
}
