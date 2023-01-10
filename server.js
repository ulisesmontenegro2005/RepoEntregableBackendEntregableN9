import { Mongo } from './src/db/mongo.js';
import { ProductsOptions } from './src/db/connection/connection.js';
import ProductsClienteSQL from './src/db/classes/ProductsClass.js';
import { createProduct } from './src/faker.js';
import { normalize, denormalize, schema } from 'normalizr';

import express  from 'express'
const app = express()
import { createServer } from 'http'
import { Server }  from 'socket.io'



const httpServer = createServer(app);
const io = new Server(httpServer, {
    
});


/////

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./src'))

/////

const products = []
let messages = {
    id:1,
    messages:[]
}

// ACTIONS

app.get('/api/productos-test', (req, res) => {
    for (let i = 0; i < 5; i++) {
        products.push(createProduct())
    }

    res.json({estado: "producos agregados correctamente"})
})

io.on('connection', socket => {
    console.log('New user connected');

//    OF PRODUCTS

    socket.emit('products', products);
    socket.on('update-products', data => {
        products.push(data);

        const sqlProducts = new ProductsClienteSQL(ProductsOptions);

        sqlProducts.crearTabla()
        .then(() => {
            return sqlProducts.addProducts(products)
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            return sqlProducts.close()
        })

        io.sockets.emit('products', products);
    })

//    OF CHAT APP

    new Mongo().getMsg()
    .then(d => {
        socket.emit('messages', d)
        socket.on('update-chat',async data => {
        
            await new Mongo().addMsgMongo(data)

            new Mongo().getMsg()
            .then(data2 => {

                // NORMALIZACION DE LOS DATOS

                data2 = {
                    id:1,
                    messages: data2
                }

                const authorSchema = new schema.Entity(
                    'author',
                    {},
                    { idAttribute: data2.messages.forEach(e => e.author.id) }
                );
        
                const messageSchema = new schema.Entity('message', {
                    author: authorSchema
                })
        
                const postSchema = new schema.Entity('post', {
                    mensajes: [messageSchema]
                })
        
                const mensajesNormalizados = normalize(data2, postSchema);

                // DESNORMALIZACION PARA QUE SEA POSIBLE GRAFICAR LOS DATOS

                const objDenormalizado = denormalize(mensajesNormalizados.result, postSchema, mensajesNormalizados.entities)

                io.sockets.emit('messages', objDenormalizado.messages)
            })
            .catch(err => {
                console.log(err);
            })
        })
    })
    .catch(err => {
        console.log(err);
    })
})

/////

const PORT = 8080

httpServer.listen(PORT, () => {
    console.log(`Escuchando en el ${PORT}`);
})