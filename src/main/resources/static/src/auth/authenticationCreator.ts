import {baseServerURL} from '../config/chatConfiguration.ts';
import { AuthLoginRequest, AuthResponse, ErrorDetails } from './auth.types.tsx';

const clientCredentials: AuthLoginRequest = {
    username:"user",
    password:"1234"
}

//Retorna true si la auth fue exitosa
export const startAuthentication = async (): Promise<boolean> => {
    try {
        console.log("se hace la request");
        
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
            return true; // Autenticación exitosa
        } else {
            //BadCredencials posible error (se enviaron mal las credenciales/usuario)
            const errorDetails: ErrorDetails = await response.json();
            console.error("Resp del serv. Error en la autenticación:", errorDetails.message);
            return false; // Autenticación fallida
        }
    } catch (error) {
        console.error("Error al realizar la request auth:", error);
        return false; // Autenticación fallida
    }
}

export const isTokenInvalid = (response: string): boolean => {
    return response.includes(
        "Failed to send message to ExecutorSubscribableChannel[clientInboundChannel]"
    );
}