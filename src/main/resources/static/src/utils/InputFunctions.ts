import { webSiteChatURL } from '../config/chatConfiguration';

export const isCorrectURL = (url: string): boolean => {
  const domain: string = window.location.origin;
  //const baseUrl = "http://localhost:3000";
  //const regexString = `^${domain.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\/chatroom\/[a-zA-Z\\d]+$`;
  const regexString: string = `^${domain}${webSiteChatURL}[a-zA-Z\\d]+$`;
  console.log("dominio: "+domain);
  console.log("url: "+url);
  //http://localhost:5173/chat-app-v2/chatroom/LIYY
  const regex: RegExp = new RegExp(regexString);
  console.log("la url escrta es correcta "+regex.test(url));

  //const regex = /^http:\/\/localhost:3000\/chatroom\/[a-zA-Z\d]+$/;
  return regex.test(url);
};

export const getRoomIdFromURL = (url: string): string => {
  if (!isCorrectURL(url)) {
    alert("La URL escrita no es correcta");
    return '';
  }
  const domain: string = window.location.origin;
  let urlSessionIdAux: string = url.split(domain + webSiteChatURL)[1];
  if (urlSessionIdAux === "") {
    alert("no se puso ningun id de room ni en el userdata ni en la url");
    return '';
  }
  return urlSessionIdAux;
};

export const copyInputSuccessful = (textToCopy: string): boolean => {
  if (navigator.clipboard) {
    navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          console.log("Text copied to clipboard! 📎");
          return true;
        })
        .catch((err) => {
          console.error("Error copying text: ", err);
          return false;
        });

  } else {
    const input = document.createElement('textarea')
    input.value = textToCopy;
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input);
    return true;
  }
  return false;
};