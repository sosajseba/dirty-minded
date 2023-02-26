import React, { useContext, useEffect, useState } from 'react'
import SocketContext from './socket_context/context';
import { emitMessage } from './sockets/emit';

const Chat = (props) => {

    const [message, setMessage] = useState('');
    const [nextReplyTime, setNextReplyTime] = useState(Date.now());
    const [spam, setSpam] = useState('');

    const { value, addMessage } = useContext(SocketContext);

    const sendMessage = (event, data) => {
        event.preventDefault();
        setMessage('');
        if (nextReplyTime < Date.now()) {
            addMessage(data)
            emitMessage(data, value.roomId)
            setNextReplyTime(addSeconds(Date.now(), 2000))
        } else {
            setSpam('Wait 2 seconds after the next message!');
            setNextReplyTime(addSeconds(Date.now(), 2000))
            setTimeout(() => {
                setSpam('')
            }, 2000)
        }
    }

    const addSeconds = (date, milliseconds) => {
        return date + milliseconds;
    }

    return (
        <div className='left'>
            <div className='chat'>
                {
                    value.chat.map((message, index) => {
                        return <p key={'message' + index}>{message.name}: {message.text}</p>
                    })
                }
                <form className='chat-input' onSubmit={e => sendMessage(e, { text: message, name: props.username })}>
                    <input type='text' value={message} onChange={e => setMessage(e.target.value)} />
                    <button type="submit">Send</button>
                </form>
                {nextReplyTime > Date.now() ? <p>{spam}</p> : <></>}
            </div>
        </div>
    )
}

export default Chat;