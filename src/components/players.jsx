import React, { useContext } from 'react'
import SocketContext from './socket_context/context';
import Player from './player';
import EmptyPlayer from './empty-player';

const Players = (props) => {

    const { value } = useContext(SocketContext);

    const maxPlayers = 12;
    const playerComponents = [];

    for (let i = 0; i < maxPlayers; i++) {
        const player = value.players[i];

        if (player) {
            playerComponents.push(
                <Player key={player.id} player={player} reader={value.readerId} />
            );
        } else {
            playerComponents.push(
                <EmptyPlayer />
            );
        }
    }

    return (

        <div className="h-404 w-4/12 rounded-2xl drop-shadow-xl pt-4 px-2 mr-4 bg-dirty-white md:mr-2 max-w-custom-1">
            <div className='h-10 mt-2'>
                <p className='text-center text-dirty-purple font-bold font-roboto'>JUGADORES: {value.players.length + '/' + props.maxPlayers}</p>
            </div>
            <div className='h-80 px-2 overflow-auto scrollbar-thumb-dirty-input scrollbar-thin scrollbar-track-rounded-10 scrollbar-thumb-rounded-10'>
                <div className='flex flex-col space-y-2'>
                    {playerComponents}
                </div>
            </div>
        </div>
    )
}

export default Players;