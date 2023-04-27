import React from 'react';

const EmptyPlayer = (props) => {
    return (
        <div className="flex items-center justify-between bg-dirty-input border-1 bg-opacity-30 border-dirty-input  h-12 rounded-lg ">
            <div className="flex items-center">
                <img
                    src='empty-brain.png'
                    alt="Imagen 1"
                    className="h-10 mx-2"
                />
                <p className="text-dirty-input font-roboto font-bold">Vacío</p>
            </div>
        </div>
    );
};

export default EmptyPlayer;
