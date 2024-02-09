//devuelve la hora en formato universal, por lo que si la otra persona esta en otra region 
//se debe convertir a su zona respectiva
export const getActualDate = (): string => {
    var fechaHoraActual: Date = new Date();
    var formatoUTC: string = fechaHoraActual.toISOString();
    return formatoUTC;
}

export const convertUTCTimeToLocalTime = (UTCFormat: string): string => {
    var fechaUTC: Date = new Date(UTCFormat);
    var opciones: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    var fechaHoraLocal: string = fechaUTC.toLocaleString(undefined, opciones);
    return fechaHoraLocal;
}

//Dado una hora UTC devuelve solo la hora local
export const getHourFromUTCFormatDate = (UTCFormat: string): string => {
    var fechaUTC: Date = new Date(UTCFormat);
    var horaLocal: number = fechaUTC.getHours();
    var minutosLocal: number = fechaUTC.getMinutes();
    var segundosLocal: number = fechaUTC.getSeconds();
    // Formatea la hora, los minutos y los segundos para que tengan dos dígitos
    var horaFormateada = padZero(horaLocal) + ':' + padZero(minutosLocal) + ':' + padZero(segundosLocal);
    return horaFormateada;
}

// Función auxiliar para agregar un cero delante si el número es menor que 10
function padZero(number: number): string {
    return (number < 10) ? '0' + number : number.toString();
}