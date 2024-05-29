const prevLink = document.getElementById("prev-page")
const nextLink = document.getElementById("next-page")
const detailsProductsList = document.getElementsByClassName("details-product-button")
const addButtons = document.querySelectorAll(".add-product-button")

const socket = io()

socket.on("productAdded", data => alert(data.status))
socket.on("productNotAdded", data => alert(data.status))

if(prevLink !== null){
    console.log(prevLink.innerHTML)
    const linkPrev = `http://localhost:8080/views/products?page=${prevLink.innerText}`
    prevLink.setAttribute('href', linkPrev)
}
if(nextLink !== null){
    console.log(nextLink.innerText)
    const linkNext = `http://localhost:8080/views/products?page=${nextLink.innerText}`
    nextLink.setAttribute('href', linkNext)
}

for (let item of detailsProductsList){
    item.innerHTML= `
    <a href="http://localhost:8080/views/products/${item.id}">Detalles</a>
    `
}

function addProduct (e){
    socket.emit("addProduct", {cid: "66565e505aa112f96f568a24", pid: e.target.id})
}
console.log(addButtons)
addButtons.forEach(element => {
    element.addEventListener("click",addProduct)
});