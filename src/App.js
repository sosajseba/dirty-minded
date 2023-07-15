import './App.css';
import '@fontsource/roboto';
import './fonts/VerditerLavanda-Regular.ttf'
import { Link, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import Terms from './routes/terms';
import Privacy from './routes/privacy';
import NotFound from './routes/not-found';
import SocketContext from './components/socket_context/context';
import { useContext } from 'react';

function App() {

  const { value } = useContext(SocketContext)

  return (
    <div className='bg-gradient min-h-screen'>
      {/* <header className=''>
        </header> */}
      <div>
        {/* Aca deberia ir el ad */}
      </div>
      <div className='flex flex-col min-h-screen justify-between'>
        <div className="pt-20">
          {
            value.gameStarted === false
              ?
              <div className='mx-auto w-80 h-max'>
                <Link to='/'>
                  <img src='dirty-minded-logo.png' />
                </Link>
              </div>
              :
              <></>
          }
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='terms' element={<Terms />} />
            <Route path='privacy' element={<Privacy />} />
            <Route path='*' element={<NotFound />} />
            {/* <Route path='about' element={<About />} /> */}
          </Routes>
        </div>
        <footer className='mx-auto p-2'>
          <ul className='flex items-center mt-2 text-dirty-white text-base font-bold justify-center font-roboto'>
            <li>
              <Link className='mr-2 hover:underline' to='terms'>
                Términos de servicio
              </Link>
            </li>
            <li>
              <span className='mr-2 hover:underline'>|</span>
            </li>
            <li>
              <Link className='mr-2 hover:underline' to='privacy'>
                Privacidad
              </Link>
            </li>
            {/* <li>
                <span className='mr-2 hover:underline'>|</span>
              </li>
              <li>
                <Link className='mr-2 hover:underline' to='about'>
                  Nosotros
                </Link>
              </li> */}
            <li>
              <span className='mr-2 hover:underline'>|</span>
            </li>
            <li>
              <a className='mr-2 hover:underline' href="mailto:astrocatgamescontact@gmail.com">
                Contacto
              </a>
            </li>
            <li>
              <span className='mr-2 hover:underline'>|</span>
            </li>
            <li>
              <a className='mr-2 hover:underline' href="https://twitter.com/AstrocatGames_" target="_blank">
                Twitter
              </a>
            </li>
            <li>
              <span className='mr-2 hover:underline'>|</span>
            </li>
            <li>
              <a className='mr-2 hover:underline' href="https://discord.com" target="_blank">
                Discord
              </a>
            </li>
          </ul>
        </footer>
        <div className='bottom-2 right-2 h-12 w-12 fixed'>
          <a href="https://twitter.com/AstrocatGames_" target="_blank">
            <img src='astrocat-logo.svg' />
          </a>
        </div>
      </div>
    </div >
  );
}

export default App;
