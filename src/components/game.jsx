import React, { useState, useContext, useRef } from "react";
import SocketContext from "./socket_context/context";
import Players from "./players";
import Chat from "./chat";
import {
  emitWinnerGetsOnePoint,
  emitPlayerPickedWhiteCard,
  emitFirstTurn,
  emitCardsDistribution,
  emitCardsReplacement,
  emitNextTurn,
  emitInitialCardsOrder,
  emitCurrentBlackCard,
} from "./sockets/emit";
import blackCards from "../data/blackcards.json";
import whiteCards from "../data/whitecards.json";
import bcpositions from "../data/bcpositions.json";
import wcpositions from "../data/wcpositions.json";
import { shuffle } from "../utils/utils";
import Rules from "./rules";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";

const Game = () => {
  const { me, value, setMe } = useContext(SocketContext);

  const [bestCardIndex, setBestCardIndex] = useState();
  const [roundWinnerId, setRoundWinnerId] = useState();
  const [selectedCardIndex, setSelectedCardIndex] = useState();
  const carouselRef = useRef(null);
  const minPlayers = window._env_.REACT_APP_MIN_PLAYERS;
  const maxPlayers = window._env_.REACT_APP_MAX_PLAYERS;
  const totalPlayers = maxPlayers - value.players.length;
  const inviteUrl = window._env_.REACT_APP_INVITE_URL;
  const disabled = minPlayers - value.players.length >= 0;
  function bestCardIsSelected(index) {
    return bestCardIndex != null
      ? index === bestCardIndex
        ? " highlight"
        : ""
      : "";
  }

  function highlightBestCard(cardIndex, winnerId) {
    if (everyonePicked() === true) {
      setRoundWinnerId(winnerId);
      setBestCardIndex(cardIndex);
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
    const reader = value.players.filter((x) => x.id === value.readerId);
    if (reader.length > 0) {
      return reader[0].name;
    }
  }

  function everyonePicked() {
    let everyonePicked = true;
    value.players.forEach((player) => {
      if (player.picking === true) {
        everyonePicked = false;
      }
    });
    return everyonePicked;
  }

  const getMe = () => value.players.filter((x) => x.id === me.id)[0];

  function pickWhiteCard(cardIndex) {
    if (selectedCardIndex != null) {
      if (getMe().picking === true) {
        setSelectedCardIndex(null);
        emitPlayerPickedWhiteCard({
          playerId: me.id,
          cardIndex: me.cards[cardIndex],
        });
        setMe((me) => {
          me.cards.splice(cardIndex, 1);
          return { ...me };
        });
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
        emitNextTurn();
      }
    }
  }

  function setCurrentBlackCard() {
    if (value.gameStarted === false) {
      const bcOrder = shuffle(
        shuffle(bcpositions, Math.random()),
        Math.random()
      );
      const wcOrder = shuffle(
        shuffle(wcpositions, Math.random()),
        Math.random()
      );
      emitInitialCardsOrder({ whiteCards: wcOrder, blackCards: bcOrder });
    }
    emitCurrentBlackCard();
  }

  function highlightMyCard(cardIndex) {
    if (getMe().picking === true) {
      // double check
      setSelectedCardIndex(cardIndex);
    }
  }

  function cardIsSelected(index) {
    var highlight =
      selectedCardIndex != null
        ? index === selectedCardIndex
          ? " highlight"
          : ""
        : "";
    return highlight;
  }

  const Lobby = () => (
    <>
      <p className="pb-5 text-center font-lavanda text-xl text-dirty-purple">
        ¡Completa la frase con tu mejor carta!
      </p>
      <div className="flex items-center justify-center sm:mx-48">
        {/* <Chat /> */}
        <Players maxPlayers={maxPlayers} minPlayers={minPlayers} />
        <Rules className="h-404 w-6/12 rounded-2xl drop-shadow-xl p-6 bg-dirty-white max-w-custom-2" />
      </div>
      <div className="flex items-center justify-center sm:mx-48">
        <div className="w-4/12 p-2 mr-4 md:mr-2 max-w-custom-1">
          {minPlayers - value.players.length <= 0 ? (
            <></>
          ) : (
            <p className="text-dirty-white text-center font-roboto text-sm">
              Esperando que se unan mas jugadores...{" "}
            </p>
          )}
        </div>
        <div className="w-6/12 pt-2 max-w-custom-2">
          {getMe().admin ? (
            <div className="flex justify-center space-x-4">
              <button
                className={`flex items-center justify-center bg-white rounded-10 text-dirty-purple font-extrabold text-center shadow-lg font-roboto h-10 w-1/2`}
                onClick={() =>
                  navigator.clipboard.writeText(inviteUrl + value.roomId)
                }
              >
                <img className="mr-1" src="link.png" />
                INVITAR
              </button>
              <button
                onClick={() => {
                  setupGame();
                }}
                disabled={disabled}
                className={`flex items-center justify-center ${
                  disabled ? "bg-dirty-disabled" : "bg-dirty-btn-p"
                } rounded-10 text-dirty-purple font-extrabold text-center shadow-lg font-roboto h-10 w-1/2`}
              >
                <img className="mr-1" src="play.png" />
                COMENZAR
              </button>
            </div>
          ) : (
            <p className="text-dirty-white text-center font-roboto text-sm">
              Esperando que el administrador inicie la partida...
            </p>
          )}
        </div>
      </div>
    </>
  );

  //CARTAS CONTAINER
  const Cartas = () => (
    <div className="flex flex-row">
      <button
        className="self-center"
        onClick={() => carouselRef?.current?.slidePrev()}
      >
        <img
          className="w-[29px] h-[29px]"
          src="left-arrow-1.svg"
          alt="left-arrow"
        />
      </button>
      <div className="w-[525px]">
        <AliceCarousel
          dotsDisabled={true}
          onSlideChange={(e) => console.log(e)}
          disableDotsControls
          disableSlideInfo={true}
          disableButtonsControls
          ref={(el) => (carouselRef.current = el)}
          responsive={{
            0: {
              items: 5,
              itemsFit: "contain",
            },
          }}
          items={me.cards.map((card, index) => (
            <div key={index} onClick={() => highlightMyCard(index)}>
              <Card text={whiteCards[card].text} />
            </div>
          ))}
        />

        {/* <button onClick={() => pickWhiteCard(selectedCardIndex)}>Ready</button> */}
      </div>
      <button
        className="self-center"
        onClick={() => carouselRef?.current?.slideNext()}
      >
        <img
          className="w-[29px] h-[29px]"
          src="right-arrow-1.svg"
          alt="left-arrow"
        />
      </button>
    </div>
  );

  //CARD PARA VOTAR
  const Card = ({ text }) => (
    <div className="w-[99px] h-[141px] py-[16px] px-[14px] rounded-[7.247px] bg-white shadow-sm">
      <span className=" font-roboto text-[11px] font-bold ">{text}</span>
    </div>
  );

  const BigCard = ({ kind, text }) => (
    <div
      className={`px-[27px] py-[31px] w-[213.253px] h-[300.943px] shadow-dirty-shadow-card ${
        kind === "white" ? "bg-white" : "bg-[#000000]"
      } rounded-[16px]`}
    >
      <span
        className={`font-black text-[21.5px] font-roboto ${
          kind === "white" ? "text-[#000000]" : "text-white"
        } `}
      >
        {text}
      </span>
    </div>
  );

  const Tabs = ({ children }) => (
    <div>
      <div></div>
    </div>
  );

  const PlayersChat = () => (
    <div className="w-[285px] h-[593px] bg-dirty-white rounded-[19px] flex flex-col py-[16px] px-[13px]">
      <div className="w-[100%] h-[100%] gap-[10px] flex flex-col">
        <BubbleMessage
          name={"Juan"}
          nameColor={"#FFB8EB"}
          message={"hola como estas"}
          isPlayer={true}
        />
        <BubbleMessage
          name={"Pedro"}
          nameColor={"#FF8585"}
          message={
            "esto es una prueba de la longituz de las bubbles chats alonso es el puto amo"
          }
        />
      </div>
      <div className="w-fit h-fit self-center">
        <input
          placeholder="Escribe un mensaje"
          className="w-[253px] h-[36px] rounded-[9px] border-[2px] border-dirty-input pl-[20px] font-roboto font-bold"
        />
      </div>
    </div>
  );

  const BubbleMessage = ({ name, nameColor, message, isPlayer }) => (
    <div
      className={` ${
        isPlayer ? "bg-[#D0FFCF]" : "bg-[#E5E2FF]"
      }  min-w-[120px] min-h-[33px] w-fit h-fit rounded-[9px] py-[8px] px-[20px]`}
    >
      <div>
        <span
          className={`text-[${nameColor}] text-[14px] font-roboto font-bold`}
        >
          {name}:
        </span>
        <span className="font-roboto text-[14px] font-bold text-dirty-purple">
          {" "}
          {message}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {value.gameOver === true ? (
        <div className="center winner">
          <p>The winner is {value.winner.name}!</p>
        </div>
      ) : (
        <>
          {value.gameStarted === true ? (
            <div className="flex flex-row justify-between w-[100%] h-[100%]">
              <div>
                <PlayerCardsContainer
                  disabledButton={value.readerId !== me.id && !everyonePicked()}
                  winnerGetsOnePoint={() => winnerGetsOnePoint()}
                >
                  {value.players
                    .filter(
                      (player) =>
                        player.id !== me.id && player.id !== value.readerId
                    )
                    .map((player, index) => (
                      <div
                        key={"pickWhiteCard" + index}
                        onClick={() => highlightBestCard(index, player.id)}
                      >
                        <PlayerWhiteCard
                          position={index + 1}
                          text={
                            player.picking === true
                              ? "Eligiendo..."
                              : whiteCards[player?.pickedCard]?.text
                          }
                        />
                      </div>
                    ))}
                  {Array.from(Array(totalPlayers).keys()).map((emptyPlayer) => (
                    <PlayerEmptyCard />
                  ))}
                </PlayerCardsContainer>
              </div>
              <div className="w-[100%] flex flex-col ">
                <div className="self-center">
                  <div className="flex flex-row gap-[36.75px] mb-[80px]">
                    <BigCard
                      text={blackCards[value.currentBlackCard]?.text.replace(
                        "{1}",
                        "________"
                      )}
                    />
                    <BigCard
                      kind={"white"}
                      text={
                        selectedCardIndex
                          ? whiteCards[selectedCardIndex]
                          : "Eligiendo..."
                      }
                    />
                  </div>
                </div>

                <div className="self-center mb-[57px] max-w-[430px] ">
                  <span className="text-[22px] font-roboto font-medium text-dirty-purple text-center">
                    Debes votar la carta de la lista que mejor complete la frase
                  </span>
                </div>

                <div className="self-center flex flex-col gap-[21px]">
                  <Cartas />
                  <div className="self-center">
                    <button className="w-[233px] h-[46px] py-[11px] px-[50px] rounded-[9px] bg-dirty-btn-p shadow-md">
                      <span className="text-dirty-purple font-roboto text-[20px] font-bold">
                        SELECCIONAR
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <PlayersChat />
              </div>
            </div>
          ) : (
            <Lobby />
          )}
        </>
      )}
    </>
  );
};

{
  /* <div className="w-[246px] h-[64px] rounded-[7px] bg-white shadow-dirty-shadow-card flex flex-row  items-center gap-[14px] pl-[9px]">

  <div className=" w-[27px] h-[27px] bg-[#48C3AD] rounded-full flex justify-center align-middle ">
    <span className="self-center text-sm font-bold text-dirty-purple font-roboto ">
      1
    </span>
  </div>

  <div>
    <span className="text-sm font-bold text-dirty-purple font-roboto">
      Moco, mucho moco
    </span>
  </div>
</div>;

<div className="w-[246px] h-[64px] rounded-[7px] bg-dirty-input  bg-opacity-30 border-dirty-input border-1" />; */
}

const PlayerEmptyCard = () => (
  <div className="w-[246px] h-[64px] rounded-[7px] bg-dirty-input  bg-opacity-30 border-dirty-input border-1" />
);

const PlayerWhiteCard = ({ position, text }) => (
  <div className="w-[246px] h-[64px] rounded-[7px] bg-white shadow-dirty-shadow-card flex flex-row  items-center gap-[14px] pl-[9px]">
    <div className=" w-[27px] h-[27px] bg-[#48C3AD] rounded-full flex justify-center align-middle ">
      <span className="self-center text-sm font-bold text-dirty-purple font-roboto ">
        {position}
      </span>
    </div>

    <div>
      <span className="text-sm font-bold text-dirty-purple font-roboto">
        {text}
      </span>
    </div>
  </div>
);

const PlayerCardsContainer = ({
  children,
  winnerGetsOnePoint,
  disabledButton,
}) => (
  <div className="w-[288px]  h-[638px] rounded-[17px]  bg-dirty-white pr-2 pt-[22.34px] flex flex-col">
    <div className="h-[100%] overflow-auto scrollbar-thumb-dirty-input scrollbar-thin scrollbar-track-rounded-10 scrollbar-thumb-rounded-10 relative">
      <div className="flex flex-col items-center  gap-[11.3px] ">
        {children}
      </div>
    </div>
    <div className="w-[100%] rounded-[17px] py-[16px] px-[21px] bg-dirty-white">
      <div
        className={`w-[100%] h-[40px] rounded-[8px] text-center flex flex-col justify-center shadow-dirty-shadow-card cursor-pointer ${
          disabledButton ? "bg-dirty-disabled" : "bg-dirty-btn-p"
        }`}
        onClick={() => !disabledButton && winnerGetsOnePoint()}
      >
        <span className="text-dirty-purple font-bold text-[17.273px] font-roboto ">
          VOTAR
        </span>
      </div>
    </div>
  </div>
);

/* 
const LeftRect = () => {
  return (
    <div className="w-2/6 h-3/4 bg-dirty-white absolute left-0 top-0"></div>
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
    slidesToScroll: 3,
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
}; */

export default Game;
