import React from 'react'

const Player = (props) => {

    return <p className={props.player.id === props.reader ? 'reader' : ''}>{`${props.player.name} (${props.player.score})`}</p>

}

export default Player;