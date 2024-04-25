import {baseServerURL} from '../config/chatConfiguration.ts';

const clientCredentials = {
    username:"user",
    password:"1234"
}

export const startAuthentication = async () => {
    fetch(baseServerURL+"/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(clientCredentials)
        })
        .then(resp => resp.json())
        .then(data => {
            console.log(data);
            localStorage.setItem("token", data.jwt);
            localStorage.setItem("username", data.username);
        }).catch(err => {
            alert("Invalid username of password")
        })
}