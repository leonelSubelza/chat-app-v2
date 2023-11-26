export const getActualDate = () => {
    var fechaHoraActual = new Date();
    //este formate es universal, por lo que si la otra persona esta en otra region se debe convertir a su
    //zona respectiva
    var formatoUTC = fechaHoraActual.toISOString();
    return formatoUTC;
}

export const convertUTCTimeToLocalTime = (UTCFormat) => {
    var fechaUTC = new Date(UTCFormat);
    var opciones = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    var fechaHoraLocal = fechaUTC.toLocaleString(undefined, opciones);
    return fechaHoraLocal;
}
