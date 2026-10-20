package com.regicide.cuenta;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class NombresProhibidosTest {

    @ParameterizedTest
    @ValueSource(strings = {"puta", "HijoDePuta", "p0lla_gorda", "sh1t", "F_U_C_K", "elnazi88", "mierda123", "maricon"})
    void rechazaLosOfensivos(String nombre) {
        assertThat(NombresProhibidos.ofensivo(nombre)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"ana", "computadora", "Disputa", "calculo", "articulo", "vehiculo", "musculo", "circulo",
            "vinculo", "diputado", "dickens", "cocktail", "reina_de_picas", "Regicida_99"})
    void admiteLosNormalesAunqueContenganUnaRaiz(String nombre) {
        assertThat(NombresProhibidos.ofensivo(nombre)).isFalse();
    }
}
