export const loadLocalStorageObject = (key:string): any => {
    return JSON.parse(localStorage.getItem(key));
}

export const saveLocalStorageObject = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
}

export const saveUserDataStorage= (key:string, value:string) => {
    if(localStorage.getItem("userData")===null){
        return;
    }
    let userDataStorage =  JSON.parse(localStorage.getItem("userData"));
    userDataStorage[key] = value;
    localStorage.setItem("userData",JSON.stringify(userDataStorage));
}