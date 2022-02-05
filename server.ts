import next from "next";
import express, { Express, Request, Response } from "express";
import { Server, createServer } from "http";
import { Server as socketioServer, Socket } from "socket.io";

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const expressApp: Express = express()
  const server: Server = createServer(expressApp)
  const io: socketioServer = new socketioServer()

  io.attach(server)

  io.on("connection", (socket: Socket) => {
    socket.on("join", (roomId) => {
      socket.join(roomId);
      console.log(`joined room ${roomId}`);
    })
    socket.on("draw", (data) => {
      socket.broadcast.emit("drawClient", data)
    })
    socket.on("clear", (data) => {
      socket.broadcast.emit("clearClient")
    })
    socket.on("disconnect", () => {
      console.log("disconnected");
    })
  })

  expressApp.use(express.static("public"))

  expressApp.all('*', (req: Request, res: Response) => {
    return handle(req, res)
  })

  server.listen(port, (err?: any) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
