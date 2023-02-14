import React, { useContext } from 'react'
import SocketContext from './socket_context/context';

const Players = () => {

    const { value } = useContext(SocketContext);

    return (
        <div className='right'>
            <p>Players:</p>
            {
                value.players.map((player, index) => {
                    return <p className={player.reads ? 'reader' : ''} key={'player' + index}>{`${player.name} (${player.score})`}</p>
                })
            }
        </div>
    )
}

export default Players;