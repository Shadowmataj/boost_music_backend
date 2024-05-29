const description = document.getElementById("description")
const productImage = document.getElementsByClassName("product-image")
const addButton = document.getElementsByClassName("add-product-button")[0]

const socket = io()

socket.on("productAdded", data => alert(data.status))
socket.on("productNotAdded", data => alert(data.status))

productImage[0].src = `https://static.wixstatic.com/media/${productImage[0].id}`

function addProduct (){
    socket.emit("addProduct", {cid: "66565e505aa112f96f568a24", pid: addButton.id})
}

addButton.addEventListener("click", addProduct)
