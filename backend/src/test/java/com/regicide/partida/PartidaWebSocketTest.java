package com.regicide.partida;

import com.regicide.juego.Fase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PartidaWebSocketTest {

    @LocalServerPort
    private int puerto;

    @Autowired
    private PartidasEnCurso partidas;

    @Test
    void alEmpezarSeRecibeElRepartoInicial() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("empezar");

            EstadoPartida estado = jugador.estado();
            assertThat(estado.fase()).isEqualTo(Fase.ATAQUE);
            assertThat(estado.mano()).hasSize(8);
            assertThat(estado.enemigo().vida()).isEqualTo(20);
            assertThat(estado.enemigosRestantes()).isEqualTo(12);
            assertThat(estado.cartasEnPosada()).isEqualTo(32);
            assertThat(estado.comodines()).isEqualTo(2);
        }
    }

    @Test
    void elEstadoNoDiceQueCartasQuedanEnLaPosada() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("empezar");

            assertThat(jugador.estadoEnBruto()).doesNotContainKeys("posada", "descarte", "castillo");
        }
    }

    @Test
    void unAtaqueValidoDevuelveElEstadoNuevo() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("empezar");
            int vida = jugador.estado().enemigo().vida();

            jugador.enviar("atacar", "{\"cartas\":[0]}");

            EstadoPartida estado = jugador.estado();
            assertThat(estado.cartasJugadas()).hasSize(1);
            assertThat(estado.enemigo().vida()).isLessThan(vida);
        }
    }

    @Test
    void unaJugadaNoValidaDevuelveUnError() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("empezar");
            jugador.estado();

            jugador.enviar("defender", "{\"cartas\":[0]}");

            assertThat(jugador.error()).isEqualTo("Ahora no toca defenderse");
        }
    }

    @Test
    void unMensajeMalFormadoDevuelveUnError() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("empezar");
            jugador.estado();

            jugador.enviar("atacar", "{\"cartas\":\"todas\"}");

            assertThat(jugador.error()).isEqualTo("Mensaje no válido");
        }
    }

    @Test
    void sinPartidaEmpezadaNoSePuedeJugar() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("atacar", "{\"cartas\":[0]}");

            assertThat(jugador.error()).isEqualTo("No tienes ninguna partida empezada");
        }
    }

    @Test
    void cadaJugadorSoloRecibeSuPartida() throws Exception {
        try (ClienteStomp ana = new ClienteStomp(puerto); ClienteStomp luis = new ClienteStomp(puerto)) {
            ana.enviar("empezar");

            assertThat(ana.estado().mano()).hasSize(8);
            assertThat(luis.sinMensajes()).isTrue();
        }
    }

    @Test
    void alAbandonarSeBorraLaPartida() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("empezar");
            jugador.estado();

            jugador.enviar("abandonar");
            jugador.enviar("atacar", "{\"cartas\":[0]}");

            assertThat(jugador.error()).isEqualTo("No tienes ninguna partida empezada");
        }
    }

    @Test
    void alDesconectarseSeBorraLaPartida() throws Exception {
        int antes = partidas.enCurso();
        ClienteStomp jugador = new ClienteStomp(puerto);
        jugador.enviar("empezar");
        jugador.estado();
        assertThat(partidas.enCurso()).isEqualTo(antes + 1);

        jugador.close();

        for (int intento = 0; intento < 50 && partidas.enCurso() > antes; intento++) {
            Thread.sleep(100);
        }
        assertThat(partidas.enCurso()).isEqualTo(antes);
    }
}
