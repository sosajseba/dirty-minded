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

export const updateRoom = (room) => {
    socket.emit('update-room', room);
};

export const initialSortCards = (randomValue) => {
    socket.emit('initial-sort-cards', randomValue);
};

export const distributeCards = (data) => {
    socket.emit('distribute-cards', data);
};
