import { socket } from "./index";

export const emitMessage = (message, room) => {
    socket.emit('send', { message, room });
};

export const joinRoom = (player, roomId) => {
    player.id = socket.id;
    socket.emit('join-room', { player, roomId });
};

export const createRoom = (room) => {
    room.players[0].id = socket.id;
    socket.emit('create-room', room);
};
