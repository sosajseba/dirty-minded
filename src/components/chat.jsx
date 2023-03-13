import React, { useContext, useState } from 'react'
import SocketContext from './socket_context/context';
import { emitMessage } from './sockets/emit';

const Chat = () => {

    const [message, setMessage] = useState('');
    const [nextReplyTime, setNextReplyTime] = useState(Date.now());
    const [spam, setSpam] = useState('');

    const { user, value, addMessage } = useContext(SocketContext);

    const sendMessage = (event, data) => {
        event.preventDefault();
        setMessage('');
        if (nextReplyTime < Date.now()) {
            addMessage(data)
            emitMessage(data, value.roomId)
            setNextReplyTime(addSeconds(Date.now(), 10000))
        } else {
            setSpam('Wait 10 seconds after the next message!');
            setNextReplyTime(addSeconds(Date.now(), 10000))
            setTimeout(() => {
                setSpam('')
            }, 10000)
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
                <form className='chat-input' onSubmit={e => sendMessage(e, { text: message, name: user.displayName })}>
                    <input type='text' value={message} onChange={e => setMessage(e.target.value)} maxLength={50}/>
                    <button type="submit">Send</button>
                </form>
                {nextReplyTime > Date.now() ? <p>{spam}</p> : <></>}
            </div>
        </div>
    )
}

export default Chat;