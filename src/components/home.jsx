import React, { useContext, useState } from 'react'
import SocketContext from './socket_context/context';
import ShortUniqueId from 'short-unique-id';
import { socket } from './sockets';
import { emitJoinRoom, emitCreateRoom } from './sockets/emit';

const uid = new ShortUniqueId({ length: window._env_.REACT_APP_ROOM_ID_LENGHT });

const Home = (props) => {

    const [userName, setUserName] = useState('');

    const { user, chooseName, setUser, setChooseName, setJoined, setMe, setRoom, addPlayer } = useContext(SocketContext);

    function create() {

        const roomId = uid();

        const room = {
            blackCards: [],
            currentBlackCard: undefined,
            gameOver: false,
            gameStarted: false,
            players: [],
            readerId: '',
            roomId: roomId,
            roomIsFull: false,
            round: 0,
            whiteCards: [],
        }

        join({ room: room, roomId: roomId, admin: true })

    }

    function join(data) {
        const player = {
            admin: data.admin,
            id: socket.id,
            name: user ? user.displayName : userName,
            pickedCard: undefined,
            picking: false,
            reads: false,
            score: 0,
        }

        const updateUsr = { displayName: player.name, id: player.id }
        localStorage.setItem('user', JSON.stringify(updateUsr));
        setUser(updateUsr);

        setMe(player);

        if (data.room) {

            data.room.players.push(player);

            setJoined(true)

            setRoom(data.room);

            emitCreateRoom(data.room);

        } else {

            addPlayer(player)

            setJoined(true)

            emitJoinRoom(player, data.roomId)
        }
    }

    function changeDisplayName() {
        if (!user) {
            const newUsr = { displayName: userName, id: socket.id }
            localStorage.setItem('user', JSON.stringify(newUsr));
            setUser(newUsr);
        }

        if (userName.length !== 0 || user.displayName) {
            setChooseName(false);
            if (props.roomId) {
                join({ room: undefined, roomId: props.roomId, admin: false });
            } else {
                create();
            }
        }
        else {
            setChooseName(true);
        }
    }

    return (
        user
            ?
            <>
                Hi {user.displayName}!
                <button onClick={changeDisplayName}>{props.roomId ? 'Join room' : 'Create room'}</button>
            </>
            :
            <>
                Pick a name!
                <input type='text' value={userName} onChange={event => setUserName(event.target.value)} />
                {chooseName ? <span>You must pick a name to continue!<br /></span> : <></>}
                <button onClick={changeDisplayName}>{props.roomId ? 'Join room' : 'Create room'}</button>
            </>
    )

}

export default Home;