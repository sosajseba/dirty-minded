import './App.css';
import { auth, db } from "./firebase/firebase";
import { ref, set, push, onValue } from "firebase/database";
import { onAuthStateChanged, signInAnonymously, updateProfile } from 'firebase/auth';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import blackCards from './data/blackcards.json';
import whiteCards from './data/whitecards.json';
import Chat from './components/chat'
import Players from './components/players';
import SocketContext from './components/socket_context/context';
import { v4 as uuidv4 } from 'uuid';
import { joinRoom, createRoom } from './components/sockets/emit';

function App() {

  const [user, setUser] = useState();
  const [userName, setUserName] = useState('');
  const [searchParams] = useSearchParams();
  //const [joined, setJoined] = useState(false);
  const [roomQuery] = useState(searchParams.get('room'));
  const [chooseName, setChooseName] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [room, setRoomOld] = useState({ gameStarted: false });
  const [me, setMe] = useState({});
  const [selectedCardIndex, setSelectedCardIndex] = useState();
  const [bestCardIndex, setBestCardIndex] = useState();
  const [roundWinnerId, setRoundWinnerId] = useState();

  const { joined, value, addPlayer, setRoom, setJoined } = useContext(SocketContext)
  //TODO: improve initial states in room and players

  const minPlayers = process.env.REACT_APP_MIN_PLAYERS;
  const maxPlayers = process.env.REACT_APP_MAX_PLAYERS;
  const cardsPerPlayer = process.env.REACT_APP_CARDS_PER_PLAYER;
  const inviteUrl = process.env.REACT_APP_INVITE_URL;

  function create() {

    const roomId = uuidv4()

    const room = {
      roomId: roomId,
      blackCards: blackCards.sort(() => 0.5 - Math.random()),
      gameStarted: false,
      readerId: '',
      gameOver: false,
      whiteCards: whiteCards.sort(() => 0.5 - Math.random()),
      players: [],
      roomIsFull: false
    }

    setIsAdmin(true);

    join({ room: room, roomId: roomId })

  }

  function join(data) {
    const player = {
      id: value.myId,
      name: user ? user.displayName : userName,
      reads: false,
      picking: false,
      score: 0
    }

    if (data.room) {

      data.room.admin = player.id

      data.room.players.push(player);
      
      setJoined(true)
      
      setRoom(data.room);

      createRoom(data.room);

    } else {

      addPlayer(player)

      joinRoom(player, data.roomId)

      console.log('Joined:', data.roomId);
    }
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
    if (!user) {
      const newUsr = { displayName: userName }
      localStorage.setItem('user', JSON.stringify(newUsr));
      setUser(newUsr);
    }

    if (userName.length !== 0 || user.displayName) {
      setChooseName(false);
      if (roomQuery) {
        join({ room: undefined, roomId: roomQuery });
      } else {
        create();
      }
    }
    else {
      setChooseName(true);
    }
  }

  function setupGame() {
    setCurrentBlackCard();
    if (value.players.length >= minPlayers && room.gameStarted === false) {
      firstTurn();
      distributeCards();
    } else {
      replenishCards();
      nextTurn();
    }
  }

  function replenishCards() {
    let roomCopy = room;
    value.players.forEach(player => {
      if (player.cards.length < cardsPerPlayer) {
        const firstCards = roomCopy.whiteCards.slice(0, 1);
        let lastCards = roomCopy.whiteCards.slice(1, roomCopy.whiteCards.length);
        player.cards = player.cards.concat(firstCards);
        lastCards = lastCards.concat(firstCards);
        roomCopy.whiteCards = lastCards;
      }
    });
    set(ref(db, 'rooms/' + value.roomId), roomCopy);
  }

  function firstTurn() {
    let roomCopy = room;
    let playersCopy = value.players;
    let playersObject = {};
    playersCopy[1].reads = true;
    roomCopy.readerId = playersCopy[1].id
    playersCopy.forEach(player => {
      if (player.reads !== true) {
        player.picking = true;
      }
      playersObject[player.id] = player
    });
    roomCopy.players = playersObject
    set(ref(db, 'rooms/' + value.roomId), roomCopy);
  }

  function nextTurn() {
    if (room.gameOver === false) {
      setRoundWinnerId(null);
      let roomCopy = room;
      let playersCopy = value.players;
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
        if (player.reads === false) {
          player.picking = true;
        }
        playersObject[player.id] = player
      });
      roomCopy.players = playersObject
      set(ref(db, 'rooms/' + (value.roomId || roomQuery)), roomCopy);
    }
  }

  function winnerGetsOnePoint() {
    setBestCardIndex(null);
    let winner = value.players.filter(x => x.id === roundWinnerId)[0]
    winner.score += 1;
    set(ref(db, 'rooms/' + (value.roomId || roomQuery) + '/players/' + roundWinnerId), winner);
    if (winner.score === 5) {
      set(ref(db, 'rooms/' + (value.roomId || roomQuery) + '/winner'), winner);
      set(ref(db, 'rooms/' + (value.roomId || roomQuery) + '/gameOver'), true);
    }
    else {
      setupGame();
    }
  }

  function distributeCards() {
    let roomCopy = room;
    roomCopy.gameStarted = true;
    value.players.forEach(player => {
      const firstCards = roomCopy.whiteCards.slice(0, cardsPerPlayer);
      let lastCards = roomCopy.whiteCards.slice(cardsPerPlayer, roomCopy.whiteCards.length);
      player.cards = firstCards;
      lastCards = lastCards.concat(firstCards);
      roomCopy.whiteCards = lastCards;
    });
    set(ref(db, 'rooms/' + value.roomId), roomCopy);
  }

  function setCurrentBlackCard() {
    let roomCopy = room;
    const firstCard = roomCopy.blackCards.slice(0, 1)[0];
    roomCopy.currentBlackCard = firstCard
    let lastBlackCards = roomCopy.blackCards.slice(1, roomCopy.blackCards.length);
    lastBlackCards.push(firstCard);
    roomCopy.blackCards = lastBlackCards;
    set(ref(db, 'rooms/' + value.roomId), roomCopy);
  }

  function getReaderName() {
    const reader = value.players.filter(x => x.id === room.readerId);
    if (reader.length > 0) {
      return reader[0].name;
    }
    return "Unknown";
    //TODO: it may be of no use
  }

  function pickWhiteCard(cardIndex) {
    if (me.picking === true) {
      setSelectedCardIndex(null)
      const myCopy = me;
      myCopy.picking = false;
      myCopy.pickedCard = myCopy.cards[cardIndex];
      myCopy.cards.splice(cardIndex, 1);
      set(ref(db, 'rooms/' + (roomQuery || value.roomId) + '/players/' + me.id), myCopy);
    }
  }

  function highlightMyCard(cardIndex) {
    if (me.picking === true) {
      setSelectedCardIndex(cardIndex)
    }
  }

  function highlightBestCard(cardIndex, winnerId) {
    if (everyonePicked() === true) {
      setRoundWinnerId(winnerId);
      setBestCardIndex(cardIndex)
    }
  }

  function everyonePicked() {
    let everyonePicked = true;
    value.players.forEach(player => {
      if (player.picking === true) {
        everyonePicked = false
      }
    });
    return everyonePicked;
  }

  function bestCardIsSelected(index) {
    return bestCardIndex != null ? (index === bestCardIndex ? ' highlight' : '') : ''
  }

  function cardIsSelected(index) {
    return selectedCardIndex != null ? (index === selectedCardIndex ? ' highlight' : '') : ''
  }

  // useEffect(() => {
  //   onAuthStateChanged(auth, handleUserStateChanged)
  // }, [])

  // useEffect(() => {
  //   const query = ref(db, 'rooms/' + (roomQuery || value.roomId));
  //   return onValue(query, (snapshot) => {
  //     const data = snapshot.val();
  //     if (snapshot.exists()) {
  //       let fooChat = [];
  //       let fooPlayers = [];
  //       const fooRoom = data
  //       if (fooRoom.chat) {
  //         fooChat = Object.values(fooRoom.chat);
  //       }
  //       if (fooRoom.players) {
  //         fooPlayers = Object.values(fooRoom.players);
  //       }
  //       setRoomOld(fooRoom)
  //       setChat(fooChat);
  //       setPlayers(fooPlayers);
  //       if (joined) {
  //         const me = fooPlayers.filter(x => x.id === user.uid)[0];
  //         setMe(me);
  //       }
  //     }
  //   });
  // }, [value.roomId])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUser(user);
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      </header>

      {joined ?
        <div>
          <div className='wrapper'>
            <Chat username={user.displayName} />
            <Players />
          </div>

          <div className='wrapper'>
            {room.gameOver === true
              ?
              <div className='center winner'>
                <p>The winner is {room.winner.name}!</p>
              </div>
              :
              <>
                {room.gameStarted === true
                  ?
                  (user.uid === room.readerId ?
                    <div className='center reader-box'>
                      <p>Choose a white card..</p>
                      <div className='black-card'>
                        <div className='card-container'>
                          {room.currentBlackCard.text.replace('{1}', '________')}
                        </div>
                      </div>
                      {
                        value.players.map((player, index) => {
                          return (
                            player.id !== me.id ?
                              <div className={'white-card' + bestCardIsSelected(index)} key={'pickWhiteCard' + index} onClick={() => highlightBestCard(index, player.id)}>
                                <div className='card-container' key={'cardContainer' + index}>
                                  {player.picking === true ? player.name + ' is choosing..' : player.pickedCard.text}
                                </div>
                              </div>
                              : <></>
                          )
                        })
                      }
                      {everyonePicked() === true ? <button onClick={() => winnerGetsOnePoint()}>Ready</button> : <></>}
                    </div>
                    :
                    <>
                      <div className='center reader-box'>
                        <p>{getReaderName()} is choosing a white card..</p>
                        <div className='black-card'>
                          <div className='card-container'>
                            {room.currentBlackCard.text.replace('{1}', '________')}
                          </div>
                        </div>
                        {
                          value.players.map((player, index) => {
                            return (
                              player.id !== room.readerId ?
                                <div className='white-card' key={'pickWhiteCard' + index}>
                                  <div className='card-container' key={'cardContainer' + index}>
                                    {player.picking === true ? player.name + ' is choosing..' : player.pickedCard.text}
                                  </div>
                                </div>
                                : <></>
                            )
                          })
                        }
                      </div>
                      <div className='center player-box'>
                        <div className='white-cards-container'>
                          {
                            me.cards.map((card, index) => {
                              return (
                                <div className={'white-card' + cardIsSelected(index)} key={'whiteCard' + index} onClick={() => highlightMyCard(index)}>
                                  <div className='card-container' key={'cardContainer' + index}>
                                    {card.text}
                                  </div>
                                </div>)
                            })
                          }
                          <button onClick={() => pickWhiteCard(selectedCardIndex)}>Ready</button>
                        </div>
                      </div>
                    </>
                  )
                  :
                  <div className='center reader-box'>
                    <p>Players joined: {value.players.length + '/' + maxPlayers}</p>
                    {(minPlayers - value.players.length) <= 0 ?
                      <></>
                      :
                      <p>Waiting for {minPlayers - value.players.length} more players to join </p>}
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
                            navigator.clipboard.writeText(inviteUrl + value.roomId);
                          }}>
                          Invite
                        </button>
                      </div>
                      :
                      <p>Waiting for the host to start the game..</p>
                    }
                  </div>
                }
              </>
            }
          </div>
        </div>
        :
        (value.roomIsFull ?
          <div>
            Room is full :C
          </div>
          :
          (user ?
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
          )
        )
      }
    </div>
  );
}

export default App;
