import React, { useState, useEffect } from "react";
import SocketContext from "./context";
import { initSockets } from './../sockets/index';

const SocketProvider = (props) => {
    const [value, setValue] = useState({
        chat: [],
        players: [],
        myId: '',
        roomId: '',
        roomIsFull: false,
        gameStarted: false,
        currentBlackCard: 0,
        readerWhiteCard: null,
        round: 0
    });

    const [blackCardsOrder, setBlackCardsOrder] = useState([])

    const [whiteCardsOrder, setWhiteCardsOrder] = useState([])

    const [joined, setJoined] = useState(false);

    const [me, setMe] = useState();

    const [user, setUser] = useState();

    const [chooseName, setChooseName] = useState(false);

    const addMessage = (message) => {
        setValue(state => {
            const list = [message];
            state.chat = state.chat.concat(list)
            return { ...state }
        });
    }

    const addPlayer = (player) => {
        setValue(state => {
            state.players.push(player)
            return { ...state }
        });
    }

    const setRoom = (room) => {
        setValue(state => {
            state.roomId = room.roomId
            state.players = room.players
            state.gameStarted = room.gameStarted
            state.gameOver = room.gameOver
            state.readerId = room.readerId
            state.sortBy = room.sortBy
            state.currentBlackCard = room.currentBlackCard
            return { ...state }
        });
    }

    useEffect(() => {
        initSockets({ me, setValue, setJoined, setMe, setBlackCardsOrder, setWhiteCardsOrder })
    }, [initSockets]);

    useEffect(() => {
    }, [me]);

    const values = { chooseName, user, me, joined, value, blackCardsOrder, whiteCardsOrder, setChooseName, addMessage, addPlayer, setRoom, setJoined, setMe, setUser, setBlackCardsOrder, setWhiteCardsOrder };

    return (
        <SocketContext.Provider value={values}>
            {props.children}
        </SocketContext.Provider>
    )
};

export default SocketProvider;