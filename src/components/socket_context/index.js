import React, { useState, useEffect } from "react";
import SocketContext from "./context";
import { initSockets } from './../sockets/index';

const SocketProvider = (props) => {
    const [value, setValue] = useState({
        chat: [],
        players: [],
        myId: '',
        roomId: '',
        roomIsFull: false
    });

    const [joined, setJoined] = useState(false);

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
            state.blackCards = room.blackCards
            state.whiteCards = room.whiteCards
            state.gameStarted = room.gameStarted
            state.gameOver = room.gameOver
            state.readerId = room.readerId
            return { ...state }
        });
    }

    useEffect(() => initSockets({ setValue, setJoined }), [initSockets]);

    const values = { joined, value, addMessage, addPlayer, setRoom, setJoined };

    return (
        <SocketContext.Provider value={values}>
            {props.children}
        </SocketContext.Provider>
    )
};

export default SocketProvider;