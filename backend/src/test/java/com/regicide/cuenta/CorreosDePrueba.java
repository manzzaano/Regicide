package com.regicide.cuenta;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Guarda los correos en vez de enviarlos, para leer los enlaces desde los tests. */
@TestConfiguration(proxyBeanMethods = false)
class CorreosDePrueba {

    record Enviado(String para, String asunto, String texto) {

        String enlace() {
            Matcher enlace = Pattern.compile("#([A-Za-z0-9_-]{43})").matcher(texto);
            if (!enlace.find()) {
                throw new AssertionError("El correo no lleva enlace: " + texto);
            }
            return enlace.group(1);
        }
    }

    static class Buzon extends Correos {

        final List<Enviado> enviados = new CopyOnWriteArrayList<>();

        Buzon() {
            super("", "prueba@example.com");
        }

        @Override
        void enviar(String para, String asunto, String texto) {
            enviados.add(new Enviado(para, asunto, texto));
        }

        List<Enviado> para(String correo) {
            return enviados.stream().filter(enviado -> enviado.para().equals(correo)).toList();
        }
    }

    @Bean
    @Primary
    Buzon buzon() {
        return new Buzon();
    }
}
