package com.chatapp.core.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateGenerator {

    public static String getActualDate() {
        // Obtener la fecha y hora actual en UTC
        LocalDateTime actualDate = LocalDateTime.now();
        // Formatear la fecha y hora en el formato deseado (solo hora, minutos y segundos)
        DateTimeFormatter formatTime = DateTimeFormatter.ofPattern("HH:mm:ss");
        return actualDate.format(formatTime);
    }

    public static String getUTCFormatDate() {
        LocalDateTime actualDate = LocalDateTime.now();
        DateTimeFormatter formatUTC = DateTimeFormatter.ISO_DATE_TIME;
        return actualDate.format(formatUTC);
    }

}
