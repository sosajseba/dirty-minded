import { socket } from './index';

export const socketEvents = ({ setValue, setJoined }) => {
    setValue(state => {
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
            setJoined(true)
            state.roomId = room.roomId
            state.players = room.players
            return { ...state }
        });
    });

    socket.on('room-is-full', (roomIsFull) => {
        setValue(state => {
            console.log(roomIsFull)
            setJoined(false);
            state.roomIsFull = roomIsFull
            return { ...state }
        });
    });
};