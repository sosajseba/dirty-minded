import './App.css';
import { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SocketContext from './components/socket_context/context';
import RoomIsFull from './components/room-full';
import Home from './components/home';
import Game from './components/game';
import '@fontsource/roboto';
import './fonts/VerditerLavanda-Regular.ttf'

function App() {

  const [searchParams] = useSearchParams();
  const [roomQuery] = useState(searchParams.get('room'));

  const { joined, value, setUser } = useContext(SocketContext)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUser(user);
    }
  }, []);

  return (
    joined
      ?
      <Game />
      :
      (
        value.roomIsFull
          ?
          <RoomIsFull />
          :
          <Home roomId={roomQuery} />
      )
  );
}

export default App;
