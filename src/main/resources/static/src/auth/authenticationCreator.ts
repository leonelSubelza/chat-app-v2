import {baseServerURL, tokenExpirationTimeByMinute} from '../config/chatConfiguration.ts';
import { AuthLoginRequest, AuthResponse, ErrorDetails } from './auth.types.tsx';
import {saveUserDataStorage} from "../utils/localStorageFunctions.ts";

const clientCredentials: AuthLoginRequest = {
    username:"user",
    password:"1234"
}

//Retorna true si la auth fue exitosa
export const startAuthentication = async (): Promise<string> => {
    try {
        const response = await fetch(baseServerURL + "/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(clientCredentials)
        });

        if (response.ok) {
            const authResponse: AuthResponse = await response.json();
            localStorage.setItem("tokenJwt", authResponse.jwt);
            let tokenExpirationDate: Date = generateTokenExpirationDate(tokenExpirationTimeByMinute);

            //asumimos que este objeto ya existe y le guardamos el expiration time
            saveUserDataStorage("tokenExpirationDate",tokenExpirationDate.toISOString());
/*            let userDataStorage =  JSON.parse(localStorage.getItem("userData"));
            userDataStorage.tokenExpirationDate = tokenExpirationDate;
            localStorage.setItem("userData",JSON.stringify(userDataStorage));*/
            return authResponse.jwt; // Autenticación exitosa
        } else {
            //BadCredencials posible error (se enviaron mal las credenciales/usuario)
            const errorDetails: ErrorDetails = await response.json();
            console.error("Resp del serv. Error en la autenticación:", errorDetails.message);
            return undefined; // Autenticación fallida
        }
    } catch (error) {
        console.error("Error al realizar la request auth:", error);
        return undefined; // Autenticación fallida
    }
}

export const isTokenInvalid = (response: string): boolean => {
    return response.includes(
        "Failed to send message to ExecutorSubscribableChannel[clientInboundChannel]"
    );
}

const generateTokenExpirationDate = (min: number): Date => {
    let actualDate = new Date();
    actualDate.setMinutes(actualDate.getMinutes()+min);
    return actualDate;
}

export const isAuthenticationExpired = (tokenExpirationDate: Date): boolean => {
    let actualDate: Date = new Date();
    // let userDataStorage: UserDataSaveLocalStorage = JSON.parse(localStorage.getItem("userData"));
    // let tokenExpirationDate = new Date(userDataStorage.tokenExpirationDate);
    if(tokenExpirationDate===undefined) {
        startAuthentication();
        return;
    }
    return tokenExpirationDate < actualDate;
}