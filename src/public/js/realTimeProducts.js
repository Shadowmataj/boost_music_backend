const socket = io()
socket.emit("handshake", "Hola, me estoy comunicando desde un socket.")
socket.on("update_db_products", data => {
    console.log(data)
    socket.emit("update_db", "New products data?")
})

socket.on("update_for_all", data => {

    const listGroup = document.getElementById("list-group-container")
    listGroup.innerHTML =""
    data.forEach(item => {
        const element = document.createElement("li")
        element.className = "list-group-item"
        element.innerHTML=`${item.title}, ${item.price}, ${item.stock}, ${item.category}, ${item.code}`
        listGroup.appendChild(element)
    });
})