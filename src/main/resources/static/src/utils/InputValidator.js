

export const isCorrectURL = (url) => {
  const domain = window.location.origin;

  //const baseUrl = "http://localhost:3000";
  //const regexString = `^${domain.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\/chatroom\/[a-zA-Z\\d]+$`;
  const regexString = `^${domain}\/chatroom\/[a-zA-Z\\d]+$`;
  const regex = new RegExp(regexString);

  //const regex = /^http:\/\/localhost:3000\/chatroom\/[a-zA-Z\d]+$/;
  return regex.test(url);
};
