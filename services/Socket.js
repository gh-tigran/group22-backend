import { Server as SocketServer } from "socket.io";
import { ALLOW_CORS } from "../middlewares/cors.js";
import jwt from "jsonwebtoken";
import { Users } from "../models/index.js";

const { JWT_SECRET } = process.env

class Socket {
  static init(server) {
    this.socket = new SocketServer(server, {
      cors: ALLOW_CORS
    });

    this.socket.on('connect', this.#handleConnect);
  }

  static #handleConnect = async (client) => {
    try {

      const { authorization } = client.handshake.headers;
      const { userId } = jwt.verify(authorization.replace('Bearer ', ''), JWT_SECRET);
      client.join(`user_${userId}`);
      client.userId = userId;

      await Users.update({
        isOnline: true
      }, {
        where: { id: userId }
      });
      this.socket.emit('user-online', { userId })
      //online
      client.on('disconnect', async () => {
        if (!this.socket.sockets.adapter.rooms.get(`user_${userId}`)) {
          await Users.update({
            lastVisit: new Date(),
            isOnline: false
          }, {
            where: { id: userId }
          });

          this.socket.emit('user-offline', { userId })
        }

      })
    } catch (e) {
      console.log(e);
      setTimeout(() => {
        client.emit('error', { message: e.message })
      }, 1000)
    }
  }

  static emit(to, event, data = {}) {
    this.socket.to(to).emit(event, data)
  }
}

export default Socket
