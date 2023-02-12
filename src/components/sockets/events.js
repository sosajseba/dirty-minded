import { socket } from './index';

export const socketEvents = ({ setValue }) => {
    setValue(state => {
        state.myId = socket.id
        return { ...state }
    });

    socket.on('receive', (data) => {
        setValue(state => {
            state.chat.push(data)
            return { ...state }
        });
    });

    socket.on('new-player', (room) => {
        setValue(state => {
            state.roomId = room.roomId
            state.players = room.players
            return { ...state }
        });
    });
};