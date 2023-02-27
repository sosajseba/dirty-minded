import './App.css';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import blackCards from './data/blackcards.json';
import whiteCards from './data/whitecards.json';
import Chat from './components/chat'
import Players from './components/players';
import SocketContext from './components/socket_context/context';
import ShortUniqueId from 'short-unique-id';
import { joinRoom, createRoom, updateRoom } from './components/sockets/emit';
import { socket } from './components/sockets/index'
import ReactGA from 'react-ga'

const uid = new ShortUniqueId({ length: window._env_.REACT_APP_ROOM_ID_LENGHT });

if (window._env_.REACT_APP_ENVIRONMENT === 'production') {
  ReactGA.initialize(window._env_.REACT_APP_GA_TRACKING_ID)
}

function App() {

  const [user, setUser] = useState();
  const [userName, setUserName] = useState('');
  const [searchParams] = useSearchParams();
  const [roomQuery] = useState(searchParams.get('room'));
  const [chooseName, setChooseName] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState();
  const [bestCardIndex, setBestCardIndex] = useState();
  const [roundWinnerId, setRoundWinnerId] = useState();

  const { me, joined, value, addPlayer, setRoom, setJoined, setMe, getRandomPlayer } = useContext(SocketContext)
  //TODO: improve initial states in room and players

  const minPlayers = window._env_.REACT_APP_MIN_PLAYERS;
  const maxPlayers = window._env_.REACT_APP_MAX_PLAYERS;
  const cardsPerPlayer = window._env_.REACT_APP_CARDS_PER_PLAYER;
  const inviteUrl = window._env_.REACT_APP_INVITE_URL;

  //#region DONE
  function create() {

    const roomId = uid();

    const room = {
      roomId: roomId,
      blackCards: [],
      gameStarted: false,
      readerId: '',
      gameOver: false,
      whiteCards: [],
      players: [],
      roomIsFull: false
    }

    join({ room: room, roomId: roomId, admin: true })

  }

  function join(data) {
    const player = {
      id: socket.id,
      name: user ? user.displayName : userName,
      admin: data.admin,
      reads: false,
      picking: false,
      score: 0,
      cards: []
    }

    const updateUsr = { displayName: player.name, id: player.id }
    localStorage.setItem('user', JSON.stringify(updateUsr));
    setUser(updateUsr);

    setMe(player);

    if (data.room) {

      data.room.players.push(player);

      setJoined(true)

      setRoom(data.room);

      createRoom(data.room);

    } else {

      addPlayer(player)

      joinRoom(player, data.roomId)
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
      if (roomQuery) {
        join({ room: undefined, roomId: roomQuery, admin: false });
      } else {
        create();
      }
    }
    else {
      setChooseName(true);
    }
  }
  //#endregion DONE

  function setupGame() {
    setCurrentBlackCard();
    if (value.players.length >= minPlayers && value.gameStarted === false) {
      firstTurn();
      distributeCards();
    } else {
      replenishCards();
      nextTurn();
    }
  }

  function replenishCards() {
    let roomCopy = value;
    roomCopy.players.forEach(player => {
      if (player.cards.length < cardsPerPlayer) {
        const firstCards = roomCopy.whiteCards.slice(0, 1);
        let lastCards = roomCopy.whiteCards.slice(1, roomCopy.whiteCards.length);
        player.cards = player.cards.concat(firstCards);
        lastCards = lastCards.concat(firstCards);
        roomCopy.whiteCards = lastCards;
      }
    });
    updateRoom(roomCopy);
  }

  function firstTurn() {
    let roomCopy = value;
    let playersCopy = value.players;
    playersCopy[1].reads = true;
    roomCopy.readerId = playersCopy[1].id
    playersCopy.forEach(player => {
      if (player.reads !== true) {
        player.picking = true;
      }
    });
    roomCopy.players = playersCopy
    updateRoom(roomCopy);
  }

  function nextTurn() {
    if (value.gameOver === false) {
      setRoundWinnerId(null);
      let roomCopy = value;
      let playersCopy = value.players;
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
      });
      roomCopy.players = playersCopy
      updateRoom(roomCopy)
    }
  }

  function winnerGetsOnePoint() {
    if (bestCardIndex != null) {
      setBestCardIndex(null);
      let roomCopy = value
      let winner;
      roomCopy.players.forEach(player => {
        if (player.id === roundWinnerId) {
          player.score += 1;
          winner = player
        }
      });

      if (winner.score === 5) {
        roomCopy.winner = winner
        roomCopy.gameOver = true;
        updateRoom(roomCopy);
      }
      else {
        updateRoom(roomCopy);
        setupGame();
      }
    }
  }

  function distributeCards() {
    let roomCopy = value;
    roomCopy.gameStarted = true;
    roomCopy.players.forEach(player => {
      const firstCards = roomCopy.whiteCards.slice(0, cardsPerPlayer);
      let lastCards = roomCopy.whiteCards.slice(cardsPerPlayer, roomCopy.whiteCards.length);
      player.cards = firstCards;
      lastCards = lastCards.concat(firstCards);
      roomCopy.whiteCards = lastCards;
    });
    updateRoom(roomCopy);
  }

  function setCurrentBlackCard() {
    let roomCopy = value;
    if (roomCopy.gameStarted === false) {
      roomCopy.blackCards = blackCards.sort(() => 0.5 - Math.random());
      roomCopy.whiteCards = whiteCards.sort(() => 0.5 - Math.random());
    }
    const firstCard = roomCopy.blackCards.slice(0, 1)[0];
    roomCopy.currentBlackCard = firstCard
    let lastBlackCards = roomCopy.blackCards.slice(1, roomCopy.blackCards.length);
    lastBlackCards.push(firstCard);
    roomCopy.blackCards = lastBlackCards;
    updateRoom(roomCopy);
  }

  function getReaderName() {
    const reader = value.players.filter(x => x.id === value.readerId);
    if (reader.length > 0) {
      return reader[0].name;
    }
    return "Unknown";
    //TODO: it may be of no use
  }

  function pickWhiteCard(cardIndex) {
    if (selectedCardIndex != null) {
      if (me.picking === true) {
        setSelectedCardIndex(null)
        let roomCopy = value;
        roomCopy.players.forEach(player => {
          if (player.id === me.id) {
            player.picking = false;
            player.pickedCard = player.cards[cardIndex];
            player.cards.splice(cardIndex, 1);
          }
        });
        updateRoom(roomCopy);
      }
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
            {value.gameOver === true
              ?
              <div className='center winner'>
                <p>The winner is {value.winner.name}!</p>
              </div>
              :
              <>
                {value.gameStarted === true
                  ?
                  (me.id === value.readerId ?
                    <div className='center reader-box'>
                      <p>Choose a white card..</p>
                      <div className='black-card'>
                        <div className='card-container'>
                          {value.currentBlackCard.text.replace('{1}', '________').replace('{player}', getRandomPlayer().name)}
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
                            {value.currentBlackCard.text.replace('{1}', '________').replace('{player}', getRandomPlayer().name)}
                          </div>
                        </div>
                        {
                          value.players.map((player, index) => {
                            return (
                              player.id !== value.readerId ?
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
                                    {card.text.replace('{player}', getRandomPlayer().name)}
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
                    {me.admin ?
                      <div>
                        {
                          (minPlayers - value.players.length) <= 0
                            ?
                            <button
                              onClick={() => {
                                setupGame()
                              }}>
                              Start
                            </button>
                            :
                            <></>
                        }

                        <button
                          onClick={() => navigator.clipboard.writeText(inviteUrl + value.roomId)}>
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
