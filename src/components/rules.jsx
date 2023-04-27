import React, { useState } from 'react'

const Rules = (props) => {

    const [step, setStep] = useState(1);

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

    return (
        <div className={props.className}>
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

export default Rules;