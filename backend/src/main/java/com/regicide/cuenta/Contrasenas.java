package com.regicide.cuenta;

import org.springframework.security.authentication.password.CompromisedPasswordChecker;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Qué contraseñas se admiten, según NIST 800-63B: de 15 a 128 caracteres, sin reglas de
 * mayúsculas o símbolos, que no sea el nombre y que no aparezca en filtraciones.
 */
@Component
class Contrasenas {

    private final CompromisedPasswordChecker filtraciones;

    Contrasenas(CompromisedPasswordChecker filtraciones) {
        this.filtraciones = filtraciones;
    }

    /** El problema de la contraseña para enseñárselo al jugador, o vacío si vale. */
    Optional<String> problema(String nombre, String contrasena) {
        if (contrasena == null) {
            return Optional.of("Falta la contraseña");
        }
        int caracteres = contrasena.codePointCount(0, contrasena.length());
        if (caracteres < 15 || caracteres > 128) {
            return Optional.of("La contraseña debe tener de 15 a 128 caracteres");
        }
        if (contrasena.equalsIgnoreCase(nombre)) {
            return Optional.of("La contraseña no puede ser tu nombre");
        }
        if (filtraciones.check(contrasena).isCompromised()) {
            return Optional.of("Esa contraseña aparece en filtraciones de datos conocidas; elige otra");
        }
        return Optional.empty();
    }
}
