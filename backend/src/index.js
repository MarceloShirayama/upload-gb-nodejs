const http = require('http')
const socketIo = require('socket.io')
const Routes = require('./routes')
const { logger } = require('./util')

const PORT = 3000

const handle = (req, res) => {
  const defaultRoute = (req, res) => res.end('Hello World')

  const routes = new Routes(io)

  const chosen = routes[req.method.toLowerCase()] || defaultRoute

  return chosen.apply(routes, [req, res])
}

const server = http.createServer(handle)

const io = socketIo(server, {
  cors: {
    origin: '*',
    credentials: false
  }
})

io.on('connection', (socket) => logger.info(`Client connected: ${socket.id}`))

// setInterval(() => {
//   io.emit('file-uploaded', 5e6)
// }, 250)

const startServer = () => {
  const { address, port } = server.address()
  logger.info(`Server listening at http://${address}:${port}`)
  logger.info(`Server at http://localhost:${PORT}`)
}

server.listen(PORT, startServer)
