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

    /** La clave del texto con el problema de la contraseña, o vacío si vale. */
    Optional<String> problema(String nombre, String contrasena) {
        if (contrasena == null) {
            return Optional.of("contrasena.falta");
        }
        int caracteres = contrasena.codePointCount(0, contrasena.length());
        if (caracteres < 15 || caracteres > 128) {
            return Optional.of("contrasena.longitud");
        }
        if (contrasena.equalsIgnoreCase(nombre)) {
            return Optional.of("contrasena.es-el-nombre");
        }
        if (filtraciones.check(contrasena).isCompromised()) {
            return Optional.of("contrasena.filtrada");
        }
        return Optional.empty();
    }
}
