const http = require('http')
const WebSocket = require('ws')
const ywsUtils = require('y-websocket/bin/utils')
const setupWSConnection = ywsUtils.setupWSConnection
// const jwt = require('jsonwebtoken')

const { Y_WEBSOCKET_PORT = 1234 } = process.env;

const server = http.createServer()
const wss = new WebSocket.Server({noServer: true})

//auth implemetation
// const SECRET = 'your-secret-key' // секрет для JWT-подписей
// server.on('upgrade', (req, socket, head) => {
//     const url = new URL(req.url, `http://${req.headers.host}`)
//     const token = url.searchParams.get('token')
//
//     try {
//         const user = jwt.verify(token, SECRET)
//         req.user = user // можно передать user.id, roles и т.д.
//
//         wss.handleUpgrade(req, socket, head, (ws) => {
//             wss.emit('connection', ws, req)
//         })
//     } catch (e) {
//         socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
//         socket.destroy()
//     }
// })

server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req)
    })
})

wss.on('connection', (ws, req) => {
    const room = new URL(req.url, `http://${req.headers.host}`).pathname.slice(1)

    // const user = req.user
    // console.log(`User ${user.id} connected to room ${room}`)
    console.log(`User connected to room ${room}`)
    setupWSConnection(ws, req, {gc: true})
})

server.listen(Y_WEBSOCKET_PORT, () => {
    console.log(`🧠 y-websocket сервер запущен на порту ${Y_WEBSOCKET_PORT}`)
})
