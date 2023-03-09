import './App.css';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import blackCards from './data/blackcards.json';
import whiteCards from './data/whitecards.json';
import bcpositions from './data/bcpositions.json';
import wcpositions from './data/wcpositions.json';
import Chat from './components/chat'
import Players from './components/players';
import SocketContext from './components/socket_context/context';
import ShortUniqueId from 'short-unique-id';
import {
  emitJoinRoom, emitCreateRoom, emitInitialCardsOrder,
  emitCurrentBlackCard, emitFirstTurn, emitCardsDistribution,
  emitCardsReplacement, emitNextTurn, emitPlayerPickedWhiteCard,
  emitWinnerGetsOnePoint
} from './components/sockets/emit';
import { socket } from './components/sockets/index'
import { shuffle } from './utils/utils';

const uid = new ShortUniqueId({ length: window._env_.REACT_APP_ROOM_ID_LENGHT });

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

  const minPlayers = window._env_.REACT_APP_MIN_PLAYERS;
  const maxPlayers = window._env_.REACT_APP_MAX_PLAYERS;
  const inviteUrl = window._env_.REACT_APP_INVITE_URL;

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

  function setupGame() {
    setCurrentBlackCard();
    if (value.players.length >= minPlayers && value.gameStarted === false) {
      emitFirstTurn();
      emitCardsDistribution();
    } else {
      emitCardsReplacement();
      if (value.gameOver === false) {
        setRoundWinnerId(null);
        emitNextTurn()
      }
    }
  }

  function winnerGetsOnePoint() {
    if (bestCardIndex != null) {
      setBestCardIndex(null);
      emitWinnerGetsOnePoint(roundWinnerId);
      setupGame();
    }
  }

  function setCurrentBlackCard() {
    if (value.gameStarted === false) {
      const bcOrder = shuffle(shuffle(bcpositions, Math.random()), Math.random())
      const wcOrder = shuffle(shuffle(wcpositions, Math.random()), Math.random())
      emitInitialCardsOrder({ whiteCards: wcOrder, blackCards: bcOrder });
    }
    emitCurrentBlackCard(value.roomId);
  }

  function getReaderName() {
    const reader = value.players.filter(x => x.id === value.readerId);
    if (reader.length > 0) {
      return reader[0].name;
    }
  }

  function pickWhiteCard(cardIndex) {
    if (selectedCardIndex != null) {
      if (getMe().picking === true) {
        setSelectedCardIndex(null)
        emitPlayerPickedWhiteCard({ playerId: me.id, cardIndex: me.cards[cardIndex] });
        setMe(me => {
          me.cards.splice(cardIndex, 1);
          return { ...me }
        })
      }
    }
  }

  function highlightMyCard(cardIndex) {
    if (getMe().picking === true) { // double check
      setSelectedCardIndex(cardIndex)
    }
  }

  const getMe = () => value.players.filter(x => x.id === me.id)[0];

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
    var highlight = selectedCardIndex != null ? (index === selectedCardIndex ? ' highlight' : '') : ''
    return highlight;
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
                          {blackCards[value.currentBlackCard].text.replace('{1}', '________').replace('{player}', getRandomPlayer().name)}
                        </div>
                      </div>
                      {
                        value.players.map((player, index) => {
                          return (
                            player.id !== me.id ?
                              <div className={'white-card' + bestCardIsSelected(index)} key={'pickWhiteCard' + index} onClick={() => highlightBestCard(index, player.id)}>
                                <div className='card-container' key={'cardContainer' + index}>
                                  {player.picking === true ? player.name + ' is choosing..' : whiteCards[player?.pickedCard]?.text}
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
                            {blackCards[value.currentBlackCard].text.replace('{1}', '________').replace('{player}', getRandomPlayer().name)}
                          </div>
                        </div>
                        {
                          value.players.map((player, index) => {
                            return (
                              player.id !== value.readerId ?
                                <div className='white-card' key={'pickWhiteCard' + index}>
                                  <div className='card-container' key={'cardContainer' + index}>
                                    {player.picking === true ? player.name + ' is choosing..' : whiteCards[player?.pickedCard]?.text}
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
                                    {whiteCards[card].text.replace('{player}', getRandomPlayer().name)}
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
                    {getMe().admin ?
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
