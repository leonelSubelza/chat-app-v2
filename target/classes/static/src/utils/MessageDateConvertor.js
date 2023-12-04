//devuelve la hora en formato universal, por lo que si la otra persona esta en otra region 
//se debe convertir a su zona respectiva
export const getActualDate = () => {
    var fechaHoraActual = new Date();
    var formatoUTC = fechaHoraActual.toISOString();
    return formatoUTC;
}

export const convertUTCTimeToLocalTime = (UTCFormat) => {
    var fechaUTC = new Date(UTCFormat);
    var opciones = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    var fechaHoraLocal = fechaUTC.toLocaleString(undefined, opciones);
    return fechaHoraLocal;
}

//Dado una hora UTC devuelve solo la hora local
export const getHourFromUTCFormatDate = (UTCFormat) => {
    var fechaUTC = new Date(UTCFormat);
    var horaLocal = fechaUTC.getHours();
    var minutosLocal = fechaUTC.getMinutes();
    var segundosLocal = fechaUTC.getSeconds();

    // Formatea la hora, los minutos y los segundos para que tengan dos dígitos
    var horaFormateada = padZero(horaLocal) + ':' + padZero(minutosLocal) + ':' + padZero(segundosLocal);

    return horaFormateada;
}

// Función auxiliar para agregar un cero delante si el número es menor que 10
function padZero(number) {
    return (number < 10) ? '0' + number : number;
}