//El id debe ser numerico de 4 o más caracteres
export const generateUserId = (): string => {
    let id: string = '';
    for (let i = 0; i < 4; i++) {
        id += Math.floor(Math.random() * 10);
    }
    return id;
}

export const generateRoomId = ():  string => {
    const alphabet = 'ABCDEFGHIJKLMOPQRSTUVWXYZ'; // Excluyendo la letra 'Ñ'
    let roomKey = '';
  
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      roomKey += alphabet.charAt(randomIndex);
    }
    return roomKey;
}