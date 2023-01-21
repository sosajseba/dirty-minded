import './App.css';
import { auth } from "./firebase/firebase";
import { onAuthStateChanged, signInAnonymously, updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';

function App() {
  
  const [user, setUser] = useState();
  const [userName, setUserName] = useState('');

  function createRoom() {
    if (!user.displayName) {
      updateProfile(auth.currentUser, {
        displayName: userName
      }).then(() => {
        setUser({ ...user, displayName: userName })
        console.log("Profile updated..", userName)
      }).catch((error) => {
        console.log(error.code, error.message)
      });
    }
    console.log('Name unchanged..')
  }

  function handleUserStateChanged(fbUser) {
    if (fbUser) {
      setUser(fbUser);
      console.log(fbUser.uid, fbUser.displayName);
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

  useEffect(() => {
    onAuthStateChanged(auth, handleUserStateChanged)
  }, [])

  useEffect(() => {
  }, [user])

  return (
    <div className="App">
      <header className="App-header">
        {user ?
          (user.displayName ?
            <>
              Hola {user.displayName}!
              <button onClick={createRoom}>CREAR SALA</button>
            </> :
            <>
              Elige un apodo
              <input type='text' value={userName} onChange={event => setUserName(event.target.value)} />
              <button onClick={createRoom}>CREAR SALA</button>
            </>
          ) :
          <>
            Loading..
          </>
        }
      </header>
    </div>
  );
}

export default App;
