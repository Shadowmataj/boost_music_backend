import * as chai from "chai"
import supertest from "supertest"

const expect = chai.expect
const requester = supertest("http://localhost:8080")
const testUser = { firstName: 'Juan', lastName: 'Perez', email: 'jpderez@gmail.com', age: 40, password: 'abc445' }
let cookie = ""

describe("Test Auth", function () {

    ///** Supertests for register endpoint */
    it("POST /auth/register debe registrar un nuevo usuario.", async function () {
        const { statusCode, redirect} = await requester.post("/auth/register").send(testUser)
        expect(redirect).to.be.true
        expect(statusCode).to.be.equal(303)
    })
    
    it("POST /auth/register No debe registrar el mismo usuario.", async function () {
        const { statusCode, redirect } = await requester.post("/auth/register").send(testUser)
        expect(redirect).to.be.true
        expect(statusCode).to.be.equal(302)
    })
    
    it("POST /auth/sessionslogin Iniciar sesión con el usuario creado.", async function () {
        const { statusCode, redirect } = await requester.post("/auth/sessionslogin").send({ email: testUser.email, password: testUser.password })
        expect(redirect).to.be.true
        expect(statusCode).to.be.equal(303)
    })
    
    
    it("POST /auth/sessionslogin No iniciar sesión por error en la contraseña.", async function () {
        const { statusCode, redirect, _body } = await requester.post("/auth/sessionslogin").send({ email: testUser.email, password: `${testUser.password}fdsa` })
        expect(redirect).to.be.true
        expect(statusCode).to.be.equal(302)
    })
    
    it("POST /auth/jwtlogin Iniciar sesión con el usuario creado por medio de jwt.", async function () {
        const result = await requester.post("/auth/jwtlogin").send({ email: testUser.email, password: testUser.password })
        expect(result.redirect).to.be.false
        expect(result._body.status).to.be.equal("OK")
        expect(result._body.payload).to.be.equal("Usuario autenticado")
        expect(result.status).to.be.equal(200)
        const cookieData = result.headers["set-cookie"][0]
        cookie = { name: cookieData.split("=")[0], value: cookieData.split("=")[1] }
        expect(cookieData).to.be.ok
        expect(cookie.name).to.be.equal("boostCookie")
        expect(cookie.value).to.be.ok
        expect(cookie.value.split("; ")[0]).to.match(new RegExp("^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$"))
        
    })
    
    it("POST /auth/jwtlogin No iniciar sesión por error en la contraseña.", async function () {
        const { statusCode, redirect, _body } = await requester.post("/auth/jwtlogin").send({ email: testUser.email, password: `${testUser.password}fdsa` })
        expect(redirect).to.be.true
        expect(statusCode).to.be.equal(302)
    })
    
    it("GET /auth/current Obtener el usuario actual.", async function () {
        const { statusCode, redirect, _body } = await requester.get("/auth/current").set("Cookie", [`${cookie.name}=${cookie.value}`])
        expect(redirect).to.be.false
        expect(statusCode).to.be.equal(200)
        expect(_body).to.have.property("firstName").and.to.be.equal(testUser.firstName)
        expect(_body).to.have.property("lastName").and.to.be.equal(testUser.lastName)
        expect(_body).to.have.property("email").and.to.be.equal(testUser.email)
        expect(_body).to.have.property("age")
        expect(_body).to.have.property("cart")
        expect(_body).to.have.property("role")
    })
    
    it("GET /auth/logout Obtener el usuario actual.", async function () {
        const { statusCode, redirect, _body } = await requester.post("/auth/logout")
        expect(redirect).to.be.true
        expect(statusCode).to.be.equal(302)
    })
})