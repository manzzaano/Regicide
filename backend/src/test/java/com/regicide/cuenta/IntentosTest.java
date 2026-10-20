package com.regicide.cuenta;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class IntentosTest {

    private final AtomicReference<Instant> ahora = new AtomicReference<>(Instant.parse("2026-10-20T10:00:00Z"));
    private final Intentos intentos = new Intentos(3, ahora::get);

    @Test
    void laIpSeBloqueaAlLlegarAlLimiteConNombresDistintos() {
        intentos.fallo("ana", "1.2.3.4");
        intentos.fallo("berta", "1.2.3.4");
        assertThat(intentos.agotadosPorIp("1.2.3.4")).isFalse();

        intentos.fallo("carla", "1.2.3.4");

        assertThat(intentos.agotadosPorIp("1.2.3.4")).isTrue();
        assertThat(intentos.agotadosPorIp("5.6.7.8")).isFalse();
    }

    @Test
    void alAcertarSeOlvidanLosFallosDelNombrePeroNoLosDeLaIp() {
        for (int i = 0; i < Intentos.POR_NOMBRE - 1; i++) {
            intentos.fallo("ana", "1.2.3.4");
        }
        intentos.acierto("ana");
        intentos.fallo("ana", "1.2.3.4");

        assertThat(intentos.agotadosPorNombre("ana")).isFalse();
        assertThat(intentos.agotadosPorIp("1.2.3.4")).isTrue();
    }

    @Test
    void elBloqueoSeLevantaALos15Minutos() {
        for (int i = 0; i < Intentos.POR_NOMBRE; i++) {
            intentos.fallo("ana", "1.2.3.4");
        }
        assertThat(intentos.agotadosPorNombre("ana")).isTrue();

        ahora.set(ahora.get().plus(Duration.ofMinutes(16)));

        assertThat(intentos.agotadosPorNombre("ana")).isFalse();
        assertThat(intentos.agotadosPorIp("1.2.3.4")).isFalse();
    }

    @Test
    void losRegistrosTienenSuPropioLimitePorIp() {
        assertThat(intentos.registrar("1.2.3.4")).isTrue();
        assertThat(intentos.registrar("1.2.3.4")).isTrue();
        assertThat(intentos.registrar("1.2.3.4")).isTrue();

        assertThat(intentos.registrar("1.2.3.4")).isFalse();
        assertThat(intentos.agotadosPorIp("1.2.3.4")).isFalse();
    }
}
