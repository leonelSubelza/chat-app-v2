import { UserData } from "../../../../context/types/types";
import { getHourFromUTCFormatDate } from "../../../../utils/MessageDateConvertor";
import { Message } from "../../../interfaces/messages";
import "./ChatMessage.css";

interface Props {
  message: Message;
  userData: UserData;
  isPublicChat: boolean;
}

const ChatMessage = ({ message, userData, isPublicChat }: Props) => {
  return (
    <>
      {message.status === "MESSAGE" ? (
        <li className={`message ${message.senderId === userData.id && "self"}`}>
          {message.senderId !== userData.id && isPublicChat && (
            <div className={`message-data-username`}>{message.senderName}</div>
          )}
          <div className="message-container">
            {message.senderId !== userData.id && (
              <div className="chat-avatar">
                <img className="avatar-img-chat" src={message.avatarImg} />
              </div>
            )}
            <div className="message-data-container">
              <div className="message-data__message-info">
                <p className="message-data__message-info-text">
                  {message.message}
                </p>
                <p className="message-data__message-info-time">
                  {getHourFromUTCFormatDate(message.date)}
                </p>
              </div>
            </div>
            {message.senderId === userData.id && (
              <div className="chat-avatar self">
                <img className="avatar-img-chat" src={userData.avatarImg} />
              </div>
            )}
          </div>
        </li>
      ) : (
        (message.status === "JOIN" || message.status === "LEAVE") && (
          <li className={"message message-connect-container"}>
            <p className="message-connect">
              {message.senderName}
              {`${message.status === "JOIN" ? " joined!" : " left!"}`}
              {` at ${getHourFromUTCFormatDate(message.date)}`}
            </p>
          </li>
        )
      )}
    </>
  );
};
export default ChatMessage;
