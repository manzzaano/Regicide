package com.regicide;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;

/** Un PostgreSQL de verdad en Docker para los tests que arrancan la aplicación. */
@TestConfiguration(proxyBeanMethods = false)
public class BaseDeDatosDePrueba {

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgres() {
        return new PostgreSQLContainer("postgres:18-alpine");
    }
}
