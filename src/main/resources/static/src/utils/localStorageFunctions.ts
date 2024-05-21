export const saveValue = (key:string, value:object) => {

}

export const saveUserDataStorage= (key:string, value:string) => {
    if(localStorage.getItem("userData")===null){
        return;
    }
    let userDataStorage =  JSON.parse(localStorage.getItem("userData"));
    userDataStorage[key] = value;
    localStorage.setItem("userData",JSON.stringify(userDataStorage));
}