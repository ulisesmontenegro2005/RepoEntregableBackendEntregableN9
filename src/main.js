const socket = io();

// ACTIONS OF PRODUCTS

const formProducto = document.getElementById('form-producto');
formProducto.addEventListener('submit', e => {
    e.preventDefault();

    const product = {
        name: document.getElementById('producto-nombre').value,
        stock: document.getElementById('producto-stock').value,
        thumbnail: document.getElementById('producto-url').value
    }

    socket.emit('update-products', product)
    formProducto.reset();
})

socket.on('products', renderProducts);
async function renderProducts(products) {

    const fetchRender = await fetch('hbs/products.hbs');
    const textoPlantilla = await fetchRender.text();
    const functionTemplate = Handlebars.compile(textoPlantilla);

    const html = functionTemplate({ products });
    document.getElementById('productos').innerHTML = html;
}

// ACTIONS OF CHAT APP

const formChat = document.getElementById('form-chat');
formChat.addEventListener('submit', e => {
    e.preventDefault();

    const hora = new Date();

    const message = {
        author: {
            id: document.getElementById('chat-mail').value,
            nombre: document.getElementById('chat-name').value,
            apellido: document.getElementById('chat-lastname').value,
            edad: document.getElementById('chat-age').value,
            alias: document.getElementById('chat-alias').value,
            icon: document.getElementById('chat-icon').value
        },
        text: document.getElementById('chat-msg').value,
        hora: '[' + hora.toLocaleString() + ']'
    }

    console.log(message);

    socket.emit('update-chat', message);
    document.getElementById('chat-msg').value = '';
})

socket.on('messages', renderMessages)
async function renderMessages(messages) {

    const fetchRender = await fetch('hbs/chat.hbs');
    const textoPlantilla = await fetchRender.text();
    const functionTemplate = Handlebars.compile(textoPlantilla);

    const html = functionTemplate({ messages });
    document.getElementById('chat').innerHTML = html;
}
