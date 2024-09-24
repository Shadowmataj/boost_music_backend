import * as chai from "chai";
import mongoose from 'mongoose';
import CartsServices from '../src/controller/carts.manager.js';

const connection = await mongoose.connect("mongodb://localhost:27017/test")
const dao = new CartsServices()
const expect = chai.expect
const product = []
let cartId = ""


describe("Test DAO Auth", function () {
    // It's run BEFORE the tests suite.
    before(function () {
        mongoose.connection.collections.carts.drop()
        mongoose.connection.collections.ticket.drop()
    })
    // It's run BEFORE EACH TEST.
    beforeEach(function () { })
    // It's run AFTER the tests suite.
    after(function () { 
    })
    // It's run AFTER EACH TEST.
    afterEach(function () { })

    it("addCart(product), debe regresar un carrito. ", async function () {
        const result = await dao.addCart(product)
        cartId = result._id
        expect(result.products).to.be.an("array")
        expect(result.date).to.be.a("string")
    })

    it("getCartById(id), obtener un carrito por medio del id. ", async function () {
        const result = await dao.getCartById(cartId)
        console.log(result)
        expect(result.status).to.be.equal("OK")
        expect(result.payload.products).to.be.an("array")
        expect(result.payload.date).to.be.a("string")
    })

    it("getCartById(id), obtener error por mal id. ", async function () {
        const result = await dao.getCartById(`${cartId}fdsd`)
        console.log(result)
        expect(result.status).to.be.equal("ERROR")
        expect(result.payload).to.be.undefined
        expect(result.type).to.be.an("string")
    })

    it("updateCart(cid, pid, quantity, email), actualizar carrito con producto. ", async function () {
        const result = await dao.updateCart(cartId, "6648eb2d0023115a4b1c8ee9", 1, "email@hotmail.com")
        console.log(result)
        expect(result.status).to.be.equal("OK")
        expect(result.payload).to.be.an("object")
        expect(result.payload.products).to.be.an("array")
        expect(result.payload.date).to.be.a("string")
    })

    it("updateCart(cid, pid, quantity, email), error por mal id en carrito o en producto carrito con producto. ", async function () {
        const result = await dao.updateCart(cartId, "6648eb2d0023114b1c8ee9", 1, "email@hotmail.com")
        console.log(result)
        expect(result.status).to.be.equal("ERROR")
        expect(result.payload).to.be.undefined
        expect(result.type).to.be.an("string")
    })

    it("updateCartProduct(cid, pid, quantity), actualizar carrito con producto. ", async function () {
        const result = await dao.updateCartProduct(cartId, "6648eb2d0023115a4b1c8ee9", 1)
        console.log(result)
        expect(result.status).to.be.equal("OK")
        expect(result.payload).to.be.an("object")
        expect(result.payload.products).to.be.an("array")
        expect(result.payload.date).to.be.a("string")
    })

    it("updateCartProduct(cid, pid, quantity), error por id incorrecto. ", async function () {
        const result = await dao.updateCartProduct(cartId, "664eb2d0023115a4b1c8ee9", 1)
        console.log(result)
        expect(result.status).to.be.equal("ERROR")
        expect(result.payload).to.be.undefined
        expect(result.type).to.be.an("string")
    })

    it("addCartProducts(cid, body), Agregar varios productos al carrito. ", async function () {
        const result = await dao.addCartProducts(cartId, [{ id: "6648eb2d0023115a4b1c8eea", quantity: 1 }, { id: "6648eb2d0023115a4b1c8ee9", quantity: 1 }])
        console.log(result)
        expect(result.status).to.be.equal("OK")
        expect(result.payload).to.be.an("array")
    })

    it("addCartProducts(cid, body), Error id ", async function () {
        const result = await dao.addCartProducts(cartId, [{ id: "6648eb2d023115a4b1c8eea", quantity: 1 }, { id: "6648eb2d0023115a4b1c8ee9", quantity: 1 }])
        console.log(result)
        expect(result.status).to.be.equal("ERROR")
        expect(result.payload).to.be.undefined
        expect(result.type).to.be.an("string")
    })

    it("deleteCartProduct(cid, pid), Eliminar producto del carrito.", async function () {
        const result = await dao.deleteCartProduct(cartId, "6648eb2d0023115a4b1c8ee9")
        console.log(result)
        expect(result.status).to.be.equal("OK")
        expect(result.payload).to.be.an("array")
    })

    it("deleteCartProduct(cid, pid), Eliminar producto del carrito.", async function () {
        const result = await dao.deleteCartProduct(cartId, "6648eb2d023115a4b18eea")
        console.log(result)
        expect(result.status).to.be.equal("ERROR")
        expect(result.type).to.be.an("string")
    })

    it("purchasedCart(cid, email), Hacer una compra.", async function () {
        const result = await dao.purchasedCart(cartId, "email@hotmail.com")
        console.log(result)
        expect(result.status).to.be.equal("OK")
        expect(result.payload).to.be.an("string")
        expect(result.alerts).to.be.an("array")
    })

    it("purchasedCart(cid, email), Error de id.", async function () {
        const result = await dao.purchasedCart(`${cartId}FDfdaSA`, "email@hotmail.com")
        console.log(result)
        expect(result.status).to.be.equal("ERROR")
        expect(result.payload).to.be.undefined
    })

    it("updateCart(cid, pid, quantity, email), actualizar carrito con producto. ", async function () {
        const result = await dao.updateCart(cartId, "6648eb2d0023115a4b1c8ee9", 1, "email@hotmail.com")
        console.log(result)
        expect(result.status).to.be.equal("OK")
        expect(result.payload).to.be.an("object")
        expect(result.payload.products).to.be.an("array")
        expect(result.payload.date).to.be.a("string")
    })

    it("deleteProducts(cid), Error id.", async function () {
        const result = await dao.deleteProducts(cartId)
        console.log(result)
        expect(result.status).to.be.equal("OK")
        expect(result.payload).to.be.equal("Se han eliminado los productos del carrito.")
    })

})