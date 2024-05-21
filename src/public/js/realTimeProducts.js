

const socket = io()

// handshake to stablish connection between client and server
socket.emit("handshake", "Hola, me estoy comunicando desde un socket.")

// listening for new data to update the products list
socket.on("update_for_all", data => {
    // getting the elemento from the dom where the db elements are deployd
    const listGroup = document.getElementById("list-group-container")
    // Erase the actual information on the DOM element.
    listGroup.innerHTML =""
    // Using de new information to update the info on the DOM
    data.forEach(item => {
        const element = document.createElement("li")
        element.className = "list-group-item"
        element.innerHTML=`${item.title}, ${item.price}, ${item.stock}, ${item.category}, ${item.code}`
        listGroup.appendChild(element)
    });
})