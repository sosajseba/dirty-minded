import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SocketContext from './socket_context/context';
import RoomIsFull from './room-full';
import Lobby from './lobby';
import Game from './game';
import '@fontsource/roboto';
import '../fonts/VerditerLavanda-Regular.ttf'

function Home() {

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
          <Lobby roomId={roomQuery} />
      )
  );
}

export default Home;
