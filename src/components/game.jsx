import React, { useState, useContext } from 'react'
import SocketContext from './socket_context/context';
import Players from './players';
import Chat from './chat';
import {
    emitWinnerGetsOnePoint, emitPlayerPickedWhiteCard, emitFirstTurn,
    emitCardsDistribution, emitCardsReplacement, emitNextTurn,
    emitInitialCardsOrder, emitCurrentBlackCard
} from './sockets/emit';
import blackCards from '../data/blackcards.json';
import whiteCards from '../data/whitecards.json';
import bcpositions from '../data/bcpositions.json';
import wcpositions from '../data/wcpositions.json';
import { shuffle } from '../utils/utils';
import Rules from './rules';
import Slider from 'react-slick';

const Game = () => {

    const { me, value, setMe } = useContext(SocketContext)

    const [bestCardIndex, setBestCardIndex] = useState();
    const [roundWinnerId, setRoundWinnerId] = useState();
    const [selectedCardIndex, setSelectedCardIndex] = useState();

    const minPlayers = window._env_.REACT_APP_MIN_PLAYERS;
    const maxPlayers = window._env_.REACT_APP_MAX_PLAYERS;
    const inviteUrl = window._env_.REACT_APP_INVITE_URL
    const disabled = (minPlayers - value.players.length) >= 0;
    function bestCardIsSelected(index) {
        return bestCardIndex != null ? (index === bestCardIndex ? ' highlight' : '') : ''
    }

    function highlightBestCard(cardIndex, winnerId) {
        if (everyonePicked() === true) {
            setRoundWinnerId(winnerId);
            setBestCardIndex(cardIndex)
        }
    }

    function winnerGetsOnePoint() {
        if (bestCardIndex != null) {
            setBestCardIndex(null);
            emitWinnerGetsOnePoint(roundWinnerId);
            setupGame();
        }
    }

    function getReaderName() {
        const reader = value.players.filter(x => x.id === value.readerId);
        if (reader.length > 0) {
            return reader[0].name;
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

    const getMe = () => value.players.filter(x => x.id === me.id)[0];

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

    function setCurrentBlackCard() {
        if (value.gameStarted === false) {
            const bcOrder = shuffle(shuffle(bcpositions, Math.random()), Math.random())
            const wcOrder = shuffle(shuffle(wcpositions, Math.random()), Math.random())
            emitInitialCardsOrder({ whiteCards: wcOrder, blackCards: bcOrder });
        }
        emitCurrentBlackCard();
    }

    function highlightMyCard(cardIndex) {
        if (getMe().picking === true) { // double check
            setSelectedCardIndex(cardIndex)
        }
    }

    function cardIsSelected(index) {
        var highlight = selectedCardIndex != null ? (index === selectedCardIndex ? ' highlight' : '') : ''
        return highlight;
    }

    return (
        <>
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
                            // <div className='center reader-box'>
                            //     <p>Choose a white card..</p>
                            //     <div className='black-card'>
                            //         <div className='card-container'>
                            //             {blackCards[value.currentBlackCard]?.text.replace('{1}', '________')}
                            //         </div>
                            //     </div>
                            //     {
                            //         value.players.map((player, index) => {
                            //             return (
                            //                 player.id !== me.id ?
                            //                     <div className={'white-card' + bestCardIsSelected(index)} key={'pickWhiteCard' + index} onClick={() => highlightBestCard(index, player.id)}>
                            //                         <div className='card-container' key={'cardContainer' + index}>
                            //                             {player.picking === true ? player.name + ' is choosing..' : whiteCards[player?.pickedCard]?.text}
                            //                         </div>
                            //                     </div>
                            //                     : <></>
                            //             )
                            //         })
                            //     }
                            //     {everyonePicked() === true ? <button onClick={() => winnerGetsOnePoint()}>Ready</button> : <></>}
                            // </div>
                            <div className="max-w-6xl">
                                <LeftRect />
                                <RightRect />
                                <CardSlider />
                                <TopCards />
                            </div>
                            :
                            // <>
                            //     <div className='center reader-box'>
                            //         <p>{getReaderName()} is choosing a white card..</p>
                            //         <div className='black-card'>
                            //             <div className='card-container'>
                            //                 {blackCards[value.currentBlackCard]?.text.replace('{1}', '________')}
                            //             </div>
                            //         </div>
                            //         {
                            //             value.players.map((player, index) => {
                            //                 return (
                            //                     player.id !== value.readerId ?
                            //                         <div className='white-card' key={'pickWhiteCard' + index}>
                            //                             <div className='card-container' key={'cardContainer' + index}>
                            //                                 {player.picking === true ? player.name + ' is choosing..' : whiteCards[player?.pickedCard]?.text}
                            //                             </div>
                            //                         </div>
                            //                         : <></>
                            //                 )
                            //             })
                            //         }
                            //     </div>
                            //     <div className='center player-box'>
                            //         <div className='white-cards-container'>
                            //             {
                            //                 me.cards.map((card, index) => {
                            //                     return (
                            //                         <div className={'white-card' + cardIsSelected(index)} key={'whiteCard' + index} onClick={() => highlightMyCard(index)}>
                            //                             <div className='card-container' key={'cardContainer' + index}>
                            //                                 {whiteCards[card].text}
                            //                             </div>
                            //                         </div>)
                            //                 })
                            //             }
                            //             <button onClick={() => pickWhiteCard(selectedCardIndex)}>Ready</button>
                            //         </div>
                            //     </div>
                            // </>
                            <div className="max-w-6xl">
                                <LeftRect />
                                <RightRect />
                                <CardSlider />
                                <TopCards />
                            </div>
                        )
                        :
                        <>
                            <p className='pb-5 text-center font-lavanda text-xl text-dirty-purple'>
                                ¡Completa la frase con tu mejor carta!
                            </p>
                            <div className="flex items-center justify-center sm:mx-48">
                                {/* <Chat /> */}
                                <Players maxPlayers={maxPlayers} minPlayers={minPlayers} />
                                <Rules className='h-404 w-6/12 rounded-2xl drop-shadow-xl p-6 bg-dirty-white max-w-custom-2' />
                            </div>
                            <div className="flex items-center justify-center sm:mx-48">
                                <div className='w-4/12 p-2 mr-4 md:mr-2 max-w-custom-1'>
                                    {(minPlayers - value.players.length) <= 0 ?
                                        <></>
                                        :
                                        <p className='text-dirty-white text-center font-roboto text-sm'>Esperando que se unan mas jugadores... </p>}
                                </div>
                                <div className='w-6/12 pt-2 max-w-custom-2'>
                                    {getMe().admin ?
                                        <div className='flex justify-center space-x-4'>
                                            <button
                                                className={`flex items-center justify-center bg-white rounded-10 text-dirty-purple font-extrabold text-center shadow-lg font-roboto h-10 w-1/2`}
                                                onClick={() => navigator.clipboard.writeText(inviteUrl + value.roomId)}>
                                                <img className='mr-1' src='link.png' />
                                                INVITAR
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setupGame()
                                                }}
                                                disabled={disabled}
                                                className={`flex items-center justify-center ${disabled ? "bg-dirty-disabled" : "bg-dirty-btn-p"} rounded-10 text-dirty-purple font-extrabold text-center shadow-lg font-roboto h-10 w-1/2`}>
                                                <img className='mr-1' src='play.png' />
                                                COMENZAR
                                            </button>
                                        </div>
                                        :
                                        <p className='text-dirty-white text-center font-roboto text-sm'>Esperando que el administrador inicie la partida...</p>
                                    }
                                </div>
                            </div>
                        </>
                    }
                </>
            }
        </>
    )

}

const LeftRect = () => {
    return (
        <div className="w-2/6 h-3/4 bg-dirty-white absolute left-0 top-0">
        </div>
    );
};

const RightRect = () => {
    return (
        <div className="w-2/6 h-3/4 bg-dirty-white absolute right-0 top-0"></div>
    );
};

const CardSlider = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3
    };

    return (
        <div className="w-full h-1/2">
            <Slider {...settings}>
                <div>
                    <div className="w-4/5 h-4/6 bg-white m-auto"></div>
                </div>
                <div>
                    <div className="w-4/5 h-4/6 bg-white m-auto"></div>
                </div>
                <div>
                    <div className="w-4/5 h-4/6 bg-white m-auto"></div>
                </div>
                <div>
                    <div className="w-4/5 h-4/6 bg-white m-auto"></div>
                </div>
            </Slider>
        </div>
    );
};

const TopCards = () => {
    return (
        <div className="w-full h-1/4 flex">
            <div className="w-1/2 h-full bg-gray-500"></div>
            <div className="w-1/2 h-full bg-gray-700"></div>
        </div>
    );
};

export default Game;