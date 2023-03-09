import io from 'socket.io-client'
import { socketEvents } from "./events";

export const socket = io.connect(window._env_.REACT_APP_SOCKET_URL);

export const initSockets = ({ setValue, setJoined, setMe, setBlackCardsOrder, setWhiteCardsOrder }) => {
  socketEvents({ setValue, setJoined, setMe, setBlackCardsOrder, setWhiteCardsOrder  });
};