package com.regicide;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.password.CompromisedPasswordChecker;
import org.springframework.security.authentication.password.CompromisedPasswordDecision;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Un PostgreSQL de verdad en Docker para los tests que arrancan la aplicación, y una lista de
 * contraseñas filtradas que no sale a internet.
 */
@TestConfiguration(proxyBeanMethods = false)
public class BaseDeDatosDePrueba {

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgres() {
        return new PostgreSQLContainer("postgres:18-alpine");
    }

    public static final String CONTRASENA_FILTRADA = "contrasena-filtrada-en-internet";

    @Bean
    @Primary
    CompromisedPasswordChecker filtracionesDePrueba() {
        return contrasena -> new CompromisedPasswordDecision(CONTRASENA_FILTRADA.equals(contrasena));
    }
}
