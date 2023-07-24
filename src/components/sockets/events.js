//import { roughSizeOfObject } from '../../utils/utils';
import { socket } from './index';

export const socketEvents = ({ setValue, setJoined, setMe }) => {
    setValue(state => {
        return { ...state }
    });

    socket.on('receive-message', (data) => {
        //console.log('receive-message', roughSizeOfObject(data))
        setValue(state => {
            state.chat.push(data)
            return { ...state }
        });
    });

    socket.on('receive-cards-distribution', (cards) => {
        //console.log('receive-cards-distribution', roughSizeOfObject(cards))
        //console.log('receive-cards-distribution', cards)
        setMe(me => {
            me.cards = cards;
            return { ...me }
        })
        setValue(state => {
            state.gameStarted = true;
            return { ...state }
        })
    });

    socket.on('receive-cards-replacement', (cards) => {
        //console.log('receive-cards-replacement', roughSizeOfObject(cards))
        //console.log('receive-cards-replacement', cards)
        setMe(me => {
            me.cards = me.cards.concat(cards);
            return { ...me }
        })
    });

    socket.on('receive-new-player', (data) => {
        //console.log('receive-new-player', roughSizeOfObject(data))
        //console.log('receive-new-player', data)
        setValue(state => {
            state.roomId = data.roomId;
            state.gameOver = false;
            state.players = data.players;
            return { ...state }
        });
    });

    socket.on('receive-room-is-full', (roomIsFull) => {
        setValue(state => {
            setJoined(false);
            state.roomIsFull = roomIsFull
            return { ...state }
        });
    });

    socket.on('receive-user-disconnected', (data) => {
        setValue(state => {
            let playersCopy = state.players.filter(x => x.id !== data.disconnected);
            playersCopy.forEach(player => {
                if (player.id === data.admin) {
                    player.admin = true;
                }
            });
            state.players = playersCopy
            return { ...state }
        });
    });

    socket.on('receive-picking-white-card', (index) => {
        //console.log('receive-picking-white-card', roughSizeOfObject(index))
        //console.log('receive-picking-white-card', index)
        setValue(state => {
            state.readerWhiteCard = index;
            return { ...state }
        });
    });

    socket.on('receive-next-turn', (readerId, index) => {
        //console.log('receive-next-turn', roughSizeOfObject(readerId))
        //console.log('receive-next-turn', readerId)
        setValue(state => {
            let playersCopy = state.players;
            playersCopy.forEach(player => {
                if (player.id === readerId) {
                    player.picking = false;
                } else {
                    player.picking = true;
                }
            });
            state.currentBlackCard = index;
            state.readerId = readerId
            state.players = playersCopy
            return { ...state }
        });
    });

    socket.on('receive-player-picked-white-card', (data) => {
        //console.log('receive-player-picked-white-card', roughSizeOfObject(data))
        //console.log('receive-player-picked-white-card', data)
        setValue(state => {
            let playersCopy = state.players;
            playersCopy.forEach(player => {
                if (player.id === data.player) {
                    player.picking = false;
                    player.pickedCard = data.pickedCard;
                }
            });
            state.players = playersCopy;
            return { ...state }
        });
    });

    socket.on('receive-winner-gets-one-point', (roundWinnerId) => {
        //console.log('receive-winner-gets-one-point', roughSizeOfObject(roundWinnerId))
        //console.log('receive-winner-gets-one-point', roundWinnerId)
        setValue(state => {
            let playersCopy = state.players;
            let winner;
            playersCopy.forEach(player => {
                if (player.id === roundWinnerId) {
                    player.score += 1;
                    winner = player
                }
            });

            if (winner.score === 5) {
                state.winner = winner
                state.gameOver = true;
            }
            state.readerWhiteCard = null;
            state.round += 1;
            state.players = playersCopy;
            return { ...state }
        });
    });
};