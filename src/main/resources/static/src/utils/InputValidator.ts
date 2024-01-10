export const isCorrectURL = (url: string): boolean => {
  const domain: string = window.location.origin;
  //const baseUrl = "http://localhost:3000";
  //const regexString = `^${domain.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\/chatroom\/[a-zA-Z\\d]+$`;
  const regexString: string = `^${domain}\/chatroom\/[a-zA-Z\\d]+$`;
  const regex: RegExp = new RegExp(regexString);

  //const regex = /^http:\/\/localhost:3000\/chatroom\/[a-zA-Z\d]+$/;
  return regex.test(url);
};

export const getRoomIdFromURL = (url: string): string => {
  if (!isCorrectURL(url)) {
    alert("La URL escrita no es correcta");
    return '';
  }
  const domain: string = window.location.origin;
  let urlSessionIdAux: string = url.split(domain + "/chatroom/")[1];
  if (urlSessionIdAux === "") {
    alert("no se puso ningun id de room ni en el userdata ni en la url");
    return '';
  }
  return urlSessionIdAux;
};
