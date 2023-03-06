import { socket } from './index';
import bcpositions from '../../data/bcpositions.json';
import wcpositions from '../../data/wcpositions.json';
import { shuffle } from '../../utils/utils';

export const socketEvents = ({ setValue, setJoined, setMe, setBlackCardsOrder, setWhiteCardsOrder }) => {
    setValue(state => {
        return { ...state }
    });

    socket.on('receive', (data) => {
        setValue(state => {
            state.chat.push(data)
            return { ...state }
        });
    });

    socket.on('receive-initial-sort-cards', (random) => {
        setBlackCardsOrder(shuffle(bcpositions, random));
        setWhiteCardsOrder(shuffle(wcpositions, random));
    });

    socket.on('receive-distribute-cards', (data) => {
        setMe(me => {
            let cards = []
            let index = (me.whiteCardsIndex * window._env_.REACT_APP_CARDS_PER_PLAYER)
            for (let i = index - window._env_.REACT_APP_CARDS_PER_PLAYER; i <= index - 1; i++) {
                cards = cards.concat(i);
            }
            me.cards = cards;
            return { ...me }
        })
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

                setMe(me => {
                    return { ...player, cards: me.cards }
                })  // maybe i should setMe in App.js to avoid too many re-renders
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