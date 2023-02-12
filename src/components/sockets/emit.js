import { socket } from "./index";

export const emitMessage = (message, room) => {
    socket.emit('send', { message, room });
};

export const joinRoom = (player, roomId) => {
    socket.emit('join-room', { player, roomId });
};

export const createRoom = (room) => {
    socket.emit('create-room', room);
};
