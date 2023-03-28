import React, { useContext, useState } from 'react'
import SocketContext from './socket_context/context';
import ShortUniqueId from 'short-unique-id';
import { socket } from './sockets';
import { emitJoinRoom, emitCreateRoom } from './sockets/emit';

const uid = new ShortUniqueId({ length: window._env_.REACT_APP_ROOM_ID_LENGHT });

const Home = (props) => {

    const { user, setUser, setChooseName, setJoined, setMe, setRoom, addPlayer } = useContext(SocketContext);

    const localUser = JSON.parse(localStorage.getItem('user'));

    const [userName, setUserName] = useState(localUser ? localUser.displayName : '');

    const [error, setError] = useState(false);

    const [step, setStep] = useState(1);

    const [brain, setBrain] = useState(localUser ? localUser.brain : 1);

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
            name: userName,
            pickedCard: undefined,
            picking: false,
            reads: false,
            score: 0,
        }

        const updateUsr = { displayName: player.name, id: player.id, brain: brain }
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (userName.trim() !== '') {
            console.log(userName)
            const newUsr = { displayName: userName, id: socket.id, brain: brain }
            localStorage.setItem('user', JSON.stringify(newUsr));
            setUser(newUsr);
            setError(false);
            if (props.roomId) {
                join({ room: undefined, roomId: props.roomId, admin: false });
            } else {
                create();
            }
        }
        else {
            setError(true);
        }
    }

    const handleInputChange = (e) => {
        setUserName(e.target.value)
        setError(false);
    };

    const nextBrain = () => {
        switch (brain) {
            case 12:
                setBrain(1)
                break;
            default:
                setBrain(x => x + 1)
                break;
        }
    };

    const prevBrain = () => {
        switch (brain) {
            case 1:
                setBrain(12)
                break;
            default:
                setBrain(x => x - 1)
                break;
        }
    };

    const nextRule = () => {
        switch (step) {
            case 6:
                setStep(1)
                break;
            default:
                setStep(x => x + 1)
                break;
        }
    };

    const prevRule = () => {
        switch (step) {
            case 1:
                setStep(6)
                break;
            default:
                setStep(x => x - 1)
                break;
        }
    };

    const points = [1, 2, 3, 4, 5, 6]

    console.log(user)
    console.log(localUser)

    return (
        <>
            <p className='pb-5 text-center font-lavanda text-xl text-dirty-purple'>
                ¡Completa la frase con tu mejor carta!
            </p>
            <div className="flex items-center justify-center sm:mx-48">
                <div className="h-404 w-4/12 rounded-2xl drop-shadow-xl p-6 mr-4 bg-dirty-white md:mr-2 max-w-custom-1">
                    <div className='h-14'>
                        <p className='text-center text-dirty-purple font-bold font-roboto'>ELIGE UN AVATAR Y UN APODO</p>
                    </div>
                    <div className='flex justify-center items-center pt-16 relative'>
                        <img src='ellipse-1.png' className="absolute" />
                        <img src={`brain-${brain}.png`} className="absolute w-18" />
                        <button className="absolute mr-28 z-10" onClick={prevBrain}>
                            <img src='left-arrow-1.svg' />
                        </button>
                        <button className="absolute ml-28 z-10" onClick={nextBrain}>
                            <img src='right-arrow-1.svg' />
                        </button>
                    </div>
                    <form noValidate onSubmit={handleSubmit}>
                        <div className='flex justify-center items-center pt-24 relative'>
                            <input
                                className={`border-2 border-dirty-input rounded-10 h-33 w-138 focus:outline-none text-dirty-purple placeholder:text-dirty-ph text-center font-roboto ${error ? 'invalid:border-dirty-error' : ''}`}
                                type="text"
                                placeholder="MiCerebrito777"
                                style={{ fontSize: '14px' }}
                                value={userName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex justify-center items-center pt-10 relative'>
                            <button
                                type='submit'
                                className="bg-dirty-btn-p rounded-10 h-33 w-138 text-dirty-purple font-extrabold text-center shadow-lg font-roboto">
                                {props.roomId ? 'UNIRME' : 'CREAR SALA'}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="h-404 w-6/12 rounded-2xl drop-shadow-xl p-6 bg-dirty-white md:ml-2 max-w-custom-2">
                    <div className='h-14'>
                        <p className='text-center text-dirty-purple font-bold font-roboto'>¿COMO SE JUEGA?</p>
                    </div>
                    <div className='flex justify-center items-center pt-16 relative'>
                        <img src={`rule-${step}.png`} className="absolute" />
                        <button className="absolute mr-28" onClick={prevRule}>
                            <img src='left-arrow-1.svg' />
                        </button>
                        <button className="absolute ml-28" onClick={nextRule}>
                            <img src='right-arrow-1.svg' />
                        </button>
                    </div>
                    <div className='flex justify-center items-center pt-18'>
                        {points.map(x => {
                            return x === step ?
                                <img src='point-selected.svg' className='mx-0.5' />
                                :
                                <img src='point.svg' className='mx-0.5' />
                        })}
                    </div>
                    <div className='pt-4 px-2 text-dirty-purple text-center font-roboto'>
                        <FirstRule step={step} />
                        <SecondRule step={step} />
                        <ThirdRule step={step} />
                        <FourthRule step={step} />
                        <FifthRule step={step} />
                        <SixthRule step={step} />
                    </div>
                </div>
            </div>
        </>
    )

}

function FirstRule({ step }) {
    if (step !== 1) {
        return null;
    }

    return (
        <>
            <p className="text-lg font-bold leading-8">1. Hay 2 tipos de cartas:</p>
            <p className="text-base font-bold leading-8">
                Negras
                <span className='text-sm'> (contienen una frase incompleta)</span>
            </p>
            <p className="text-base font-bold leading-8">
                Blancas
                <span className='text-sm'> (contienen una frase o palabra
                    que completa las cartas negras)</span>
            </p>
        </>
    );
}

function SecondRule({ step }) {
    if (step !== 2) {
        return null;
    }

    return (
        <>
            <p className="text-lg font-bold leading-8">2. El juego elige aleatoriamente</p>
            <p className="text-base font-bold leading-8">
                <span className='text-sm'> una carta negra y todos los jugadores deben
                    una carta blanca que mejor complete la frase</span>
            </p>
        </>
    );
}

function ThirdRule({ step }) {
    if (step !== 3) {
        return null;
    }

    return (
        <>
            <p className="text-lg font-bold leading-8">3. Una vez que todos hayan</p>
            <p className="text-base font-bold leading-7">
                <span className='text-sm'>seleccionado, podrán leer la carta negra
                    con cada versión completada por los demás
                    jugadores y votar la mejor, el que tiene
                    más votos se lleva el punto</span>
            </p>
        </>
    );
}

function FourthRule({ step }) {
    if (step !== 4) {
        return null;
    }

    return (
        <>
            <p className="text-lg font-bold leading-8">4. Al finalizar cada ronda,</p>
            <p className="text-base font-bold leading-8">
                <span className='text-sm'>se reparte una carta nueva
                    para cada jugador que reemplazará
                    la que utilizó en la ronda pasada</span>
            </p>
        </>
    );
}

function FifthRule({ step }) {
    if (step !== 5) {
        return null;
    }

    return (
        <>
            <p className="text-lg font-bold leading-8">5. La partida termina</p>
            <p className="text-base font-bold leading-8">
                <span className='text-sm'>cuando uno de los jugadores
                    con la mente más sucia
                    llegue a los 5 puntos</span>
            </p>
        </>
    );
}

function SixthRule({ step }) {
    if (step !== 6) {
        return null;
    }

    return (
        <>
            <p className="text-lg font-bold leading-8">6. Juega en llamada con tus amigos</p>
            <p className="text-base font-bold leading-8">
                ¡Es mucho más divertido!
            </p>
        </>
    );
}

export default Home;