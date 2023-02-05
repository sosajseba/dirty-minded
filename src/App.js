import './App.css';
import { auth, db } from "./firebase/firebase";
import { ref, set, push, onValue } from "firebase/database";
import { onAuthStateChanged, signInAnonymously, updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import blackCards from './data/blackcards.json';
import whiteCards from './data/whitecards.json';
// TODO: only the host should have all cards in browser at start

function App() {

  const [user, setUser] = useState();
  const [userName, setUserName] = useState('');
  const [searchParams] = useSearchParams();
  const [joined, setJoined] = useState(false);
  const [chat, setChat] = useState([]);
  const [roomQuery] = useState(searchParams.get('room'));
  const [roomId, setRoomId] = useState();
  const [message, setMessage] = useState('');
  const [nextReplyTime, setNextReplyTime] = useState(Date.now());
  const [spam, setSpam] = useState('');
  const [players, setPlayers] = useState([]);
  const [roomIsFull, setRoomIsFull] = useState(false);
  const [chooseName, setChooseName] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [room, setRoom] = useState({ gameStarted: false });
  const [turnIndex, setTurnIndex] = useState(0);
  //TODO: improve initial states in room and players

  const minPlayers = process.env.REACT_APP_MIN_PLAYERS;
  const maxPlayers = process.env.REACT_APP_MAX_PLAYERS;
  const cardsPerPlayer = process.env.REACT_APP_CARDS_PER_PLAYER;
  const inviteUrl = process.env.REACT_APP_INVITE_URL;

  function createRoom() {
    const room = {
      blackCards: blackCards.sort(() => 0.5 - Math.random()),
      admin: auth.currentUser.uid,
      gameStarted: false,
      readerId: '',
      gameOver: false,
      whiteCards: whiteCards.sort(() => 0.5 - Math.random()),
    }

    setRoom(room);

    const roomKey = push(ref(db, 'rooms/'), room).key;

    setIsAdmin(true);

    setRoomId(roomKey);

    joinRoom(roomKey)

  }

  function joinRoom(roomQuery) {
    if (players.length < Number(maxPlayers)) {
      const player = {
        id: auth.currentUser.uid,
        name: user.displayName || userName,
        reads: false
      }

      set(ref(db, 'rooms/' + roomQuery + '/players/' + auth.currentUser.uid), player)

      setRoomId(roomQuery);

      setJoined(true);

      console.log('Joined:', roomQuery);
    }
    else {
      setRoomIsFull(true);
    }
  }

  function sendMessage() {
    if (nextReplyTime < Date.now()) {
      setSpam('');
      push(ref(db, 'rooms/' + (roomQuery || roomId) + '/chat'), { message: message, name: user.displayName });
    } else {
      setSpam('Wait 2 seconds after the next message!');
    }
    setNextReplyTime(addSeconds(Date.now(), 2000))
  }

  function handleUserStateChanged(user) {
    if (user) {
      setUser(user);
    } else {
      signInAnonymously(auth)
        .then(() => {
          setUser(auth.currentUser)
          console.log("Signed in..")
        })
        .catch((error) => {
          console.log(error.code, error.message)
        });
    }
  }

  function changeDisplayName() {
    if (!user.displayName) {
      console.log("ChangeDisplayName")
      updateProfile(auth.currentUser, {
        displayName: userName
      }).then(() => {
        setUser({ ...user, displayName: userName })
      }).catch((error) => {
        console.log(error.code, error.message)
      });
    }

    if (userName.length !== 0 || user.displayName) {
      setChooseName(false);
      if (roomQuery) {
        joinRoom(roomQuery);
      } else {
        createRoom();
      }
    }
    else {
      setChooseName(true);
    }
  }

  function setupGame() {
    if (players.length >= minPlayers) {
      distributeCards();
      setCurrentBlackCard();
      firstTurn();
      initGame();
    }
  }

  function initGame() {

  }

  function firstTurn() {
    let roomCopy = room;
    let playersCopy = players;
    let playersObject = {};
    playersCopy[1].reads = true;
    roomCopy.readerId = playersCopy[1].id
    playersCopy.forEach(player => {
      playersObject[player.id] = player
    });
    roomCopy.players = playersObject
    set(ref(db, 'rooms/' + roomId), roomCopy);
  }

  function nextTurn() {
    let roomCopy = room;
    let playersCopy = players;
    let playersObject = {};
    for (let i = 0; i < playersCopy.length; i++) {
      if (playersCopy[i].reads === true) {
        playersCopy[i].reads = false;
        if (playersCopy.length - 1 === i) {
          playersCopy[0].reads = true;
          roomCopy.readerId = playersCopy[0].id
        } else {
          playersCopy[i + 1].reads = true;
          roomCopy.readerId = playersCopy[i + 1].id
        }
        break;
      }
    }
    playersCopy.forEach(player => {
      playersObject[player.id] = player
    });
    roomCopy.players = playersObject
    set(ref(db, 'rooms/' + roomId), roomCopy);
  }

  function distributeCards() {
    let roomCopy = room;
    roomCopy.gameStarted = true;
    players.forEach(player => {
      const firstCards = roomCopy.whiteCards.slice(0, cardsPerPlayer);
      const lastCards = roomCopy.whiteCards.slice(cardsPerPlayer, roomCopy.whiteCards.length);
      player.cards = firstCards;
      roomCopy.whiteCards = lastCards;
    });
    set(ref(db, 'rooms/' + roomId), roomCopy);
  }

  function setCurrentBlackCard() {
    let roomCopy = room;
    const firstCard = roomCopy.blackCards.slice(0, 1)[0];
    roomCopy.currentBlackCard = firstCard
    let lastBlackCards = roomCopy.blackCards.slice(1, roomCopy.blackCards.length);
    lastBlackCards.push(firstCard);
    roomCopy.blackCards = lastBlackCards;
    set(ref(db, 'rooms/' + roomId), roomCopy);
  }

  function addSeconds(date, milliseconds) {
    return date + milliseconds;
  }

  useEffect(() => {
    console.log("AuthUseEffect")
    onAuthStateChanged(auth, handleUserStateChanged)
  }, [])

  useEffect(() => {
    const query = ref(db, 'rooms/' + (roomQuery || roomId));
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (snapshot.exists()) {
        let fooChat = [];
        let fooPlayers = [];
        const fooRoom = data
        if (fooRoom.chat) {
          fooChat = Object.values(fooRoom.chat);
        }
        if (fooRoom.players) {
          fooPlayers = Object.values(fooRoom.players);
        }
        setRoom(fooRoom)
        setChat(fooChat);
        setPlayers(fooPlayers);
        console.log("RoomUseEffect")
      }
    });
  }, [roomId])

  return (
    <div className="App">
      <header className="App-header">
        {joined ?
          <div className='wrapper'>
            <div className='left'>
              <div className='chat'>
                {
                  chat.map((message, index) => {
                    return <p key={'message' + index}>{message.name}: {message.message}</p>
                  })
                }
                <div className='chat-input'>
                  <input type='text' value={message} onChange={event => setMessage(event.target.value)} />
                  <button onClick={sendMessage} onKeyDown={sendMessage}>Send</button>
                </div>
                <p>{spam}</p>
              </div>
            </div>
            <div className='right'>
              <p>Players:</p>
              {
                players.map((player, index) => {
                  return <p className={player.reads ? 'reader' : ''} key={'player' + index}>{player.name}</p>
                })
              }
            </div>
            <div className='center'>
              {room.gameStarted
                ?
                (user.uid === room.readerId ?
                  <>
                    <p>It is your turn!</p>
                    <button onClick={nextTurn}>Next turn</button>
                  </>
                  :
                  <>
                    <p>It is {players[turnIndex].name}'s turn!</p>
                  </>
                )
                :
                <>
                  <p>Players joined: {players.length + '/' + maxPlayers}</p>
                  {(minPlayers - players.length) <= 0 ?
                    <></>
                    :
                    <p>Waiting for {minPlayers - players.length} more players to join </p>}
                  {isAdmin ?
                    <div>
                      <button
                        onClick={() => {
                          setupGame()
                        }}>
                        Start
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(inviteUrl + roomId);
                        }}>
                        Invite
                      </button>
                    </div>
                    :
                    <p>Waiting for the host to start the game..</p>
                  }
                </>
              }
            </div>
          </div>
          :
          (roomIsFull ?
            <div>
              Room is full :C
            </div>
            :
            (user ?
              (user.displayName ?
                <>
                  Hi {user.displayName}!
                  <button onClick={changeDisplayName}>{roomQuery ? 'Join room' : 'Create room'}</button>
                </> :
                <>
                  Pick a name!
                  <input type='text' value={userName} onChange={event => setUserName(event.target.value)} />
                  {chooseName ? <span>You must pick a name to continue!<br /></span> : <></>}
                  <button onClick={changeDisplayName}>{roomQuery ? 'Join room' : 'Create room'}</button>
                </>
              ) :
              <>
                Loading..
              </>
            )
          )
        }
      </header>
    </div>
  );
}

export default App;
