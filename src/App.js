import logo from './logo.svg';
import './App.css';
import { auth } from "./firebase/firebase";
import { signInAnonymously, updateProfile } from 'firebase/auth';
import { useState } from 'react';

function App() {

  const [userName, setUserName] = useState("");

  function createRoom() {
    signInAnonymously(auth)
      .then(() => {
        console.log("Signed in..")
        updateProfile(auth.currentUser, {
          displayName: userName
        }).then(() => {
          console.log("Profile updated..", userName)
        }).catch((error) => {
          console.log(error.code, error.message)
        });
      })
      .catch((error) => {
        console.log(error.code, error.message)
      });
  }

  return (
    <div className="App">
      <header className="App-header">
        ELIGE UN APODO
        <input type='text' value={userName} onChange={event => setUserName(event.target.value)} />
        <button onClick={createRoom}>CREAR SALA</button>
      </header>
    </div>
  );
}

export default App;
