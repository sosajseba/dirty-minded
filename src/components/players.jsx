import React, { useContext } from 'react'
import SocketContext from './socket_context/context';
import Player from './player';

const Players = (props) => {

    const { value } = useContext(SocketContext);

    return (
        <div className='right'>
            <p>{props.title}</p>
            {
                value.players.map((player, index) => {
                    return <Player key={'player' + index} player={player} reader={value.readerId}/>
                })
            }
        </div>
    )
}

export default Players;