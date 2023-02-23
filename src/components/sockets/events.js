import { socket } from './index';

export const socketEvents = ({ setValue, setJoined, setMe }) => {
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
            setJoined(false);
            state.roomIsFull = roomIsFull
            return { ...state }
        });
    });

    socket.on('room-updated', (room) => {
        const user = JSON.parse(localStorage.getItem('user'));
        // maybe chat should be outside the room
        room.players.forEach(player => {
            if (player.id === user.id) {
                setMe(player)  // maybe i should setMe in App.js to avoid too many re-renders
            }
        });
        setValue(state => {
            state = room
            return { ...state }
        });
    });

    socket.on('user-disconnected', (data) => {
        const user = JSON.parse(localStorage.getItem('user'));
        data.forEach(player => {
            if (player.id === user.id) {
                setMe(player)  // maybe i should setMe in App.js to avoid too many re-renders
            }
        });
        setValue(state => {
            state.players = data
            return { ...state }
        });
    });
};