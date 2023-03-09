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
        setMe(me => {
            me.cards = me.cards.concat(cards);
            return { ...me }
        })
    });

    socket.on('receive-new-player', (data) => {
        //console.log('receive-new-player', roughSizeOfObject(data))
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
                if(player.id === data.admin){
                    player.admin = true;
                }
            });
            state.players = playersCopy
            return { ...state }
        });
    });

    socket.on('receive-current-black-card', (index) => {
        //console.log('receive-current-black-card', roughSizeOfObject(index))
        setValue(state => {
            state.currentBlackCard = index;
            return { ...state }
        });
    });

    socket.on('receive-first-turn', (index) => {
        setValue(state => {
            let roomCopy = state;
            let playersCopy = state.players;
            roomCopy.players[index].reads = true;
            roomCopy.readerId = playersCopy[index].id
            playersCopy.forEach(player => {
                if (player.reads !== true) {
                    player.picking = true;
                }
            });
            state.players = playersCopy;
            return { ...state }
        });
    });

    socket.on('receive-next-turn', () => {
        setValue(state => {
            let roomCopy = state;
            let playersCopy = state.players;
            for (let i = 0; i < playersCopy.length; i++) {
                if (playersCopy[i].reads === true) {
                    playersCopy[i].reads = false;
                    if (playersCopy.length - 1 === i) {
                        playersCopy[0].reads = true;
                        roomCopy.readerId = playersCopy[0].id
                    } else {
                        playersCopy[i + 1].reads = true;
                        roomCopy.readerId = playersCopy[i + 1].id
                    }
                    break;
                }
            }
            playersCopy.forEach(player => {
                if (player.reads === false) {
                    player.picking = true;
                }
            });
            state.players = playersCopy
            return { ...state }
        });
    });

    socket.on('receive-player-picked-white-card', (data) => {
        //console.log('receive-player-picked-white-card', roughSizeOfObject(data))
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
            state.round++
            state.players = playersCopy;
            return { ...state }
        });
    });
};