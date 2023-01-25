import './App.css';
import { auth, db } from "./firebase/firebase";
import { ref, set, push, onValue } from "firebase/database";
import { onAuthStateChanged, signInAnonymously, updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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

  function createRoom() {
    const room = {
      blackCards: [],
      admin: auth.currentUser.uid,
      gameOver: false,
      players: [],
      whiteCards: [],
      chat: []
    }

    const roomKey = push(ref(db, 'rooms/'), room).key;

    console.log("Created room", roomKey);

    setRoomId(roomKey);

    joinRoom(roomKey)

  }

  function joinRoom(roomQuery) {

    const player = {
      id: auth.currentUser.uid,
      name: auth.currentUser.displayName,
    }

    set(ref(db, 'rooms/' + roomQuery + '/players/' + auth.currentUser.uid), player)

    setJoined(true);

    console.log('Joined to the room', roomQuery);
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
      updateProfile(auth.currentUser, {
        displayName: userName
      }).then(() => {
        setUser({ ...user, displayName: userName })
      }).catch((error) => {
        console.log(error.code, error.message)
      });
    }

    if (roomQuery) {
      joinRoom(roomQuery);
    } else {
      createRoom();
    }
  }

  function addSeconds(date, milliseconds) {
    return date + milliseconds;
  }

  useEffect(() => {
    const query = ref(db, 'rooms/' + (roomQuery || roomId) + '/chat');
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (snapshot.exists()) {
        setChat(Object.values(data))
      }
    });
  }, [joined])

  useEffect(() => {
    onAuthStateChanged(auth, handleUserStateChanged)
  }, [])

  useEffect(() => {
    console.log('User updated..')
  }, [user])

  return (
    <div className="App">
      <header className="App-header">
        {joined ?
          <>
            {
              chat.map((message, index) => {
                return <p key={'message' + index}>{message.name}: {message.message}</p>
              })
            }
            <input type='text' value={message} onChange={event => setMessage(event.target.value)} />
            <button onClick={sendMessage} onKeyDown={sendMessage}>Send</button>
            <p>{spam}</p>
          </>
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
                <button onClick={changeDisplayName}>{roomQuery ? 'Join room' : 'Create room'}</button>
              </>
            ) :
            <>
              Loading..
            </>
          )
        }
      </header>
    </div>
  );
}

export default App;
