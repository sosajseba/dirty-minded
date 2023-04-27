import React from 'react';

const Player = (props) => {
  return (
    <div className="flex items-center justify-between bg-white border-white border 1 h-12 shadow-md drop-shadow-md rounded-lg">
      <div className="flex items-center">
        <img
          src={`player-${props.player.brain}.png`}
          alt="Imagen 1"
          className="h-10 mx-2"
        />
        <p className="text-dirty-purple font-roboto font-bold">{props.player.name}</p>
      </div>
      {props.player.admin && (
        <img
          src="admin.png"
          alt="Imagen 2"
          className="h-6 mr-2"
        />
      )}
    </div>
  );
};

export default Player;
