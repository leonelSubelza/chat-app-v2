//Resp del serv en caso de auth válida
export interface AuthResponse {
    username: string,
    message: string,
    jwt: string,
    status: boolean
}

//Obj que se envía en la request para la auth
export interface AuthLoginRequest {
    username: string,
    password: string
}

//Obj que se recibe en caso de error en la auth
export interface ErrorDetails {
    timestamp: string,
    message: string,
    details: string,
    statusCode: string
}