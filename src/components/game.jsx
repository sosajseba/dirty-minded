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

const Game = () => {

    const { me, value, setMe } = useContext(SocketContext)

    const [bestCardIndex, setBestCardIndex] = useState();
    const [roundWinnerId, setRoundWinnerId] = useState();
    const [selectedCardIndex, setSelectedCardIndex] = useState();

    const minPlayers = window._env_.REACT_APP_MIN_PLAYERS;
    const maxPlayers = window._env_.REACT_APP_MAX_PLAYERS;
    const inviteUrl = window._env_.REACT_APP_INVITE_URL

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
        <div>
            <div className='wrapper'>
                <Chat />
                <Players title="Players:" />
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
                                            {blackCards[value.currentBlackCard]?.text.replace('{1}', '________')}
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
                                                {blackCards[value.currentBlackCard]?.text.replace('{1}', '________')}
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
                                                                {whiteCards[card].text}
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
    )

}

export default Game;