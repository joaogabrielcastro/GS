import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (!this.socket) {
      this.socket = io("http://localhost:3005", {
        transports: ["websocket"],
      });

      this.socket.on("connect", () => {
        console.log("Socket conectado");
        this.socket?.emit("join", userId);
      });

      this.socket.on("disconnect", () => {
        console.log("Socket desconectado");
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }
}

export default new SocketService();
