package com.regicide.partida;

import com.regicide.BaseDeDatosDePrueba;
import com.regicide.juego.Carta;
import com.regicide.juego.Fase;
import com.regicide.juego.JugadorSencillo;
import com.regicide.juego.JugadorSencillo.Atacar;
import com.regicide.juego.JugadorSencillo.Defender;
import com.regicide.juego.JugadorSencillo.UsarComodin;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import java.util.Comparator;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(BaseDeDatosDePrueba.class)
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
    void unaPartidaSeJuegaEnteraPorWebSocket() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("empezar");
            EstadoPartida estado = jugador.estado();

            for (int turno = 0; turno < 500 && !terminada(estado); turno++) {
                int ataque = estado.fase() == Fase.DEFENSA ? estado.enemigo().ataque() : 0;
                switch (JugadorSencillo.decidir(estado.fase(), estado.mano(), ataque)) {
                    case Atacar atacar -> jugador.enviar("atacar", "{\"cartas\":" + atacar.cartas() + "}");
                    case Defender defender -> jugador.enviar("defender", "{\"cartas\":" + defender.cartas() + "}");
                    case UsarComodin ignorada -> jugador.enviar("comodin");
                }
                estado = jugador.estado();
            }

            assertThat(terminada(estado)).isTrue();
        }
    }

    private static boolean terminada(EstadoPartida estado) {
        return estado.fase() == Fase.VICTORIA || estado.fase() == Fase.DERROTA;
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
            EstadoPartida inicial = jugador.estado();
            int vida = inicial.enemigo().vida();
            // La más baja: el 10 de tréboles dobla a 20 y mataría a la sota justo, vaciando las cartas jugadas.
            Carta menor = inicial.mano().stream().min(Comparator.comparingInt(Carta::valor)).orElseThrow();

            jugador.enviar("atacar", "{\"cartas\":[" + inicial.mano().indexOf(menor) + "]}");

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
    void enInglesElErrorLlegaEnInglesConElMismoCodigo() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto, null, "en-US,en;q=0.9")) {
            jugador.enviar("empezar");
            jugador.estado();

            jugador.enviar("defender", "{\"cartas\":[0]}");

            assertThat(jugador.errorConCodigo())
                    .isEqualTo(new MensajeDeError("jugada.no-toca-defender", "It is not time to defend"));
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
    void unaPosicionVaciaDevuelveUnError() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("empezar");
            jugador.estado();

            jugador.enviar("atacar", "{\"cartas\":[null]}");

            assertThat(jugador.error()).isEqualTo("Mensaje no válido");
        }
    }

    @Test
    void unAtaqueSinCuerpoDevuelveUnError() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("empezar");
            jugador.estado();

            jugador.enviar("atacar", "");

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
        // La partida del test anterior se borra en segundo plano al cerrarse su cliente.
        for (int intento = 0; intento < 50 && partidas.enCurso() > 0; intento++) {
            Thread.sleep(100);
        }
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
