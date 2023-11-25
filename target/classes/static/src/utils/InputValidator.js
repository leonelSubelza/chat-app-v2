export const isCorrectURL = (url) => {
  const domain = window.location.origin;

  //const baseUrl = "http://localhost:3000";
  //const regexString = `^${domain.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\/chatroom\/[a-zA-Z\\d]+$`;
  const regexString = `^${domain}\/chatroom\/[a-zA-Z\\d]+$`;
  const regex = new RegExp(regexString);

  //const regex = /^http:\/\/localhost:3000\/chatroom\/[a-zA-Z\d]+$/;
  return regex.test(url);
};

export const getRoomIdFromURL = (url) => {
  if (!isCorrectURL(url)) {
    alert("La URL escrita no es correcta");
    return;
  }
  const domain = window.location.origin;
  let urlSessionIdAux = url.split(domain + "/chatroom/")[1];
  if (urlSessionIdAux === "") {
    alert("no se puso ningun id de room ni en el userdata ni en la url");
    return;
  }
  return urlSessionIdAux;
};
