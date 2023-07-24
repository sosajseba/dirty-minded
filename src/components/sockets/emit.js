import { socket } from "./index";

export const emitMessage = (message, room) => {
    socket.emit('emit-message', { message, room });
};

export const emitJoinRoom = (player, roomId) => {
    socket.emit('emit-join-room', { player, roomId });
};

export const emitCreateRoom = (room) => {
    socket.emit('emit-create-room', room);
};

export const emitFirstTurn = () => {
    socket.emit('emit-first-turn', null);
};

export const emitNextTurn = () => {
    socket.emit('emit-next-turn', null);
};

export const emitPickingWhiteCard = (data) => {
    socket.emit('emit-picking-white-card', data);
};

export const emitInitialCardsOrder = (data) => {
    socket.emit('emit-initial-cards-order', data);
};

export const emitCardsDistribution = () => {
    socket.emit('emit-cards-distribution', null);
};

export const emitCardsReplacement = () => {
    socket.emit('emit-cards-replacement', null);
};

export const emitPlayerPickedWhiteCard = (data) => {
    socket.emit('emit-player-picked-white-card', data);
};

export const emitWinnerGetsOnePoint = (data) => {
    socket.emit('emit-winner-gets-one-point', data);
};
