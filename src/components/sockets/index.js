import io from 'socket.io-client'
import { socketEvents } from "./events";

export const socket = io.connect('http://localhost:3001');

export const initSockets = ({ me, setValue, setJoined, setMe }) => {
  socketEvents({ me, setValue, setJoined, setMe });
};