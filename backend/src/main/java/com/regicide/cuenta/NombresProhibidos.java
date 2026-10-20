package com.regicide.cuenta;

import java.util.List;
import java.util.Locale;

/**
 * Nombres ofensivos u obscenos, que la clasificación enseñaría a todo el mundo. Se buscan raíces dentro
 * del nombre, quitando guiones bajos y deshaciendo el leet (p0lla, sh1t), y antes se borran las palabras
 * inocentes que las contienen (computadora, cálculo), para no rechazar nombres normales.
 */
// ponytail: lista fija y corta; si se cuela alguno, se añade aquí con su test.
final class NombresProhibidos {

    private static final List<String> RAICES = List.of(
            // Español
            "puta", "puto", "polla", "follar", "follad", "mierda", "cabron", "maricon", "marica", "zorra",
            "culo", "verga", "pendej", "gilipoll", "chocho", "mamada", "pajer",
            "violad", "sudaca", "negrata", "subnormal", "mongolo", "tortillera", "bollera", "travelo",
            // Inglés
            "fuck", "shit", "bitch", "cunt", "dick", "pussy", "whore", "slut", "cock", "nigg", "fagg",
            "retard", "rapist", "porn", "penis", "vagina", "boob", "tits", "jizz", "wank", "asshole",
            // Odio
            "nazi", "hitler", "kkk", "siegheil");

    private static final List<String> INOCENTES = List.of(
            "comput", "disput", "reput", "imput", "diput", "amput",
            "iculo", "lculo", "nculo", "rculo", "sculo",
            "dickens", "cockpit", "cocktail", "peacock", "hitchcock");

    private NombresProhibidos() {
    }

    static boolean ofensivo(String nombre) {
        String limpio = nombre.toLowerCase(Locale.ROOT).replace("_", "")
                .replace('0', 'o').replace('1', 'i').replace('3', 'e').replace('4', 'a')
                .replace('5', 's').replace('7', 't').replace('8', 'b').replace('9', 'g');
        for (String inocente : INOCENTES) {
            limpio = limpio.replace(inocente, "-");
        }
        String buscado = limpio;
        return RAICES.stream().anyMatch(buscado::contains);
    }
}
