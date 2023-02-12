import { createContext } from "react";

const SocketContext = createContext({
    chat: [],
    players: [],
    myId: '',
    roomId: ''
});

export default SocketContext;