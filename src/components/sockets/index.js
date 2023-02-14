import io from 'socket.io-client'
import { socketEvents } from "./events";

export const socket = io.connect(process.env.REACT_APP_SOCKET_URL);

export const initSockets = ({ me, setValue, setJoined, setMe }) => {
  socketEvents({ me, setValue, setJoined, setMe });
};