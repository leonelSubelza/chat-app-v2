//El id debe ser numerico de 4 o más caracteres
export const generateUserId = () => {
    let id = '';
    for (let i = 0; i < 4; i++) {
        id += Math.floor(Math.random() * 10);
    }
    return id;
}