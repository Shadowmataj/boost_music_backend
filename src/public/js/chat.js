const socket = io()

// handshake to stablish connection between client and server
socket.emit("handshake", "Hola, me estoy comunicando desde un socket.")
let user = null
const chatBox = document.getElementById('chatBox');
const sendButton = document.getElementById('send-button');
const messagesList = document.getElementById('list-group-container');
const listElements = document.getElementsByTagName("li")



const askForUser = async () => {
    const result = await Swal.fire({
        title: 'Coderhouse',
        input: 'text',
        text: 'Usuario',
        inputValidator: value => { return !value && 'Se debe indicar usuario' },
        allowOutsideClick: false

    });

    user = result.value;

    for(let item of listElements){
        const text = item.lastElementChild.textContent
        const elementText = text.split("Enviado por: ")
        if(elementText[1] === user)item.outerHTML=`<li class="right">${item.innerHTML}</li>`
    }
}
const addNewMessage = (message, userMail) => {
    const messageContainer = document.createElement("li")
    if(userMail === user) messageContainer.className = "right"
    messageContainer.innerHTML = `
    <div class="message">${message}</div>
    <div class="user">Enviado por: ${userMail}</div>`
    chatBox.value = ""
    messagesList.appendChild(messageContainer)
    messagesList.scrollTop = messagesList.scrollHeight
}

const sendNewMessage = () => {
    if (chatBox.value !== "") {
        const message = { user: user, message: chatBox.value }
        socket.emit("newMessage", message)
        addNewMessage(chatBox.value, user)
    }

}

const sendNewMessageChatBox = (event) => {
    if (event.key === "Enter") sendNewMessage()
}


askForUser()
sendButton.addEventListener("click", sendNewMessage)
chatBox.addEventListener("keyup", sendNewMessageChatBox)
// listening for new data to update the products list
socket.on("updateChat", data => {
    addNewMessage(data.message, data.user)
})
