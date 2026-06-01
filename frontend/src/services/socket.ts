import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/env";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ["websocket"],
        auth: { token },
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

  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void) {
    this.socket?.off(event, callback);
  }
}

export default new SocketService();
