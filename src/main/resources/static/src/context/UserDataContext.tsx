import type {UserData, UserDataContextType, UserDataSaveLocalStorage} from './types/types.ts';
import React, {ReactNode, useContext, useRef, useState} from 'react'
import {imageLinks, loadAvatars} from '../services/avatarsLinks.ts';
import {generateUserId} from '../utils/IdGenerator.ts';
import {MessagesStatus} from '../components/interfaces/messages.status.ts';
import {ChatUserRole, UserChat} from '../components/interfaces/chatRoom.types.ts';
import {Message} from '../components/interfaces/messages.ts';
import {loadLocalStorageObject, saveLocalStorageObject} from "../utils/localStorageFunctions.ts";

interface UserDataProviderProps {
    children: ReactNode;
}

/*
export const userContext = React.createContext({});

export function useUserDataContext (){
  return useContext(userContext);
}
*/

const UserDataLocalStorageInitialValue: UserDataSaveLocalStorage = {
    id: "",
    username: "",
    tokenExpirationDate: null,
    avatarImg: ""
}

const userDataInitialValue: UserData = {
    id: '',
    username: '',
    connected: false,
    message: '',
    urlSessionid: '',
    status: MessagesStatus.JOIN,
    avatarImg: '',
    chatRole: ChatUserRole.CLIENT,
    tokenExpirationDate: null
}

const chatRoomUserInitialValue: UserChat = {
    id: '0',
    username: "CHATROOM",
    joinDate: "-",
    avatarImg: imageLinks[0],
    hasUnreadedMessages: false,
    chatRole: ChatUserRole.CLIENT
}

export const userContext = React.createContext<UserDataContextType>(undefined);

export function useUserDataContext(): UserDataContextType {
    return useContext(userContext);
}

export function UserDataContext({children}: UserDataProviderProps) {

    //flag que hace que se espere hasta que este componente se termine de cargar
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

    //verifica que la room a la que se quiere conectar existe
    const [channelExists, setChannelExists] = useState<boolean>(false);

    //OBJ que contiene la conexion con el ws
    const stompClient = useRef<any>(null);

    const [imageLinks, setImageLinks] = useState<string[]>([]);

    const [userData, setUserData] = useState<UserData>(userDataInitialValue);

    const [chats, setChats] = useState<Map<UserChat, Message[]>>(new Map);
    const [tab, setTab] = useState<UserChat>();
    const [bannedUsers, setBannedUsers] = useState<UserChat[]>(new Array<UserChat>);

    const [tokenJwt, setTokenJwt] = useState<string>(localStorage.getItem('tokenJwt'));

    const resetChats = (): void => {
        let chatsAux: Map<UserChat, Message[]> = chats;
        for (var obj of chatsAux) {
            chats.delete(obj[0]);
        }
        //chatroom reset
        chats.set(chatRoomUserInitialValue, new Array<Message>);
        setChats(new Map(chats));
        setTab(Array.from(chats.keys())[0])
    }

    const loadUserDataValues = (): void => {
        let imageLinksAux: string[] = loadAvatars();
        let userDataStorage: UserDataSaveLocalStorage = !loadLocalStorageObject('userData') ?
            UserDataLocalStorageInitialValue
            : loadLocalStorageObject('userData');
        if (userDataStorage.id === "") {
            userDataStorage.id = generateUserId();
        }

        if (userDataStorage.avatarImg === '') {
            userDataStorage.avatarImg = imageLinksAux[0]
        }

        //Por alguna razón este hijo de puta si no existe da null y no undefined como avatarimg
        if (userDataStorage.username === "") {
            userDataStorage.username = 'Anónimo' + userDataStorage.id;
        }
        saveLocalStorageObject("userData",userDataStorage);
        setTokenJwt(localStorage.getItem('tokenJwt'));
        // userData.id = userId;
        let tokenExpirationDateAux: Date = userDataStorage.tokenExpirationDate === null
            ? null : new Date(userDataStorage.tokenExpirationDate);
        setUserData({
            ...userData,
            "id": userDataStorage.id,
            "username": userDataStorage.username,
            "avatarImg": userDataStorage.avatarImg,
            "tokenExpirationDate": tokenExpirationDateAux
        });

        //Esto lo hago porque react es una mierda que no actualiza los valores al instante
        userData.id = userDataStorage.id;
        userData.username = userDataStorage.username;
        userData.avatarImg = userDataStorage.avatarImg;
        userData.tokenExpirationDate = tokenExpirationDateAux;
        resetChats();
        setIsDataLoading(false);
        setImageLinks(imageLinksAux);
    }

    return (
        <userContext.Provider
            value={{
                channelExists, setChannelExists,
                isDataLoading, setIsDataLoading,
                userData, setUserData,
                tab, setTab,
                stompClient,
                loadUserDataValues,
                resetChats,
                chats, setChats,
                tokenJwt, setTokenJwt,
                bannedUsers, setBannedUsers,
                imageLinks
            }}
        >
            {children}
        </userContext.Provider>
    )
}