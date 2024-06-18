import { io } from "socket.io-client";

export const socket = io('http://35.196.84.245', {
    autoConnect: false,
})