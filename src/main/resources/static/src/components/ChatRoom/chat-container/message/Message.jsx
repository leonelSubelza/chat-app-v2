import { getHourFromUTCFormatDate } from '../../../../utils/MessageDateConvertor';
import './Message.css';

const Message = ({ message, userData, isPublicChat }) => {
    return (
        <>
            {(message.status === 'MESSAGE') ?
                <li className={`message ${message.senderId === userData.userId && "self"}`}>
                    {message.senderId !== userData.userId && !isPublicChat &&
                        <div className='message-data-username'>{message.senderName}</div>}

                    <div className='message-container'>
                        {message.senderId !== userData.userId &&
                            <div className="chat-avatar">
                                <img className="avatar-img-chat" src={message.avatarImg} />
                            </div>}
                        <div className="message-data-container">
                            <div className='message-data__message-info'>
                                <p className='message-data__message-info-text'>{message.message}</p>
                                <p className='message-data__message-info-time'>{getHourFromUTCFormatDate(message.date)}</p>
                            </div>
                        </div>
                        {message.senderId === userData.userId &&
                            <div className="chat-avatar self">
                                <img className="avatar-img-chat" src={userData.avatarImg} />
                            </div>}
                    </div>
                </li>
                :
                (message.status === 'JOIN' || message.status === 'LEAVE') &&
                <li className={'message message-connect-container'}>
                    <p className='message-connect'>
                        {message.senderName}{`${message.status === 'JOIN' ? ' joined!' : ' left!'}`}{ ` at ${getHourFromUTCFormatDate(message.date)}` }
                    </p>
                </li>
            }
        </>
    )
}
export default Message;