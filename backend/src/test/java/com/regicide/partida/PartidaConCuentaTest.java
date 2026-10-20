package com.regicide.partida;

import com.regicide.BaseDeDatosDePrueba;
import com.regicide.ClienteHttp;
import com.regicide.ClienteHttp.Jugador;
import com.regicide.juego.Fase;
import com.regicide.juego.JugadorSencillo;
import com.regicide.juego.JugadorSencillo.Atacar;
import com.regicide.juego.JugadorSencillo.Defender;
import com.regicide.juego.JugadorSencillo.UsarComodin;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(BaseDeDatosDePrueba.class)
class PartidaConCuentaTest {

    @LocalServerPort
    private int puerto;

    private ClienteHttp api;

    @BeforeEach
    void preparar() {
        api = new ClienteHttp(puerto);
    }

    @Test
    void unaPartidaTerminadaApareceEnMisPartidasYEnLaClasificacion() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();
        Fase resultado;
        try (ClienteStomp jugador = new ClienteStomp(puerto, ana.token())) {
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
            resultado = estado.fase();
        }

        List<Map<String, Object>> misPartidas = lista(api.get("/api/games/me", ana.token()).cuerpo());
        assertThat(misPartidas).hasSize(1);
        assertThat(misPartidas.getFirst()).containsEntry("resultado", resultado.name());

        List<Map<String, Object>> clasificacion = lista(api.get("/api/leaderboard", null).cuerpo());
        assertThat(clasificacion).anySatisfy(puesto -> assertThat(puesto)
                .containsEntry("nombre", ana.nombre())
                .containsEntry("simulado", false));
        assertThat(clasificacion).anySatisfy(puesto -> assertThat(puesto)
                .containsEntry("nombre", "lucia_mtz")
                .containsEntry("simulado", true));
    }

    @Test
    void losSimuladosVanDePrincipianteANivelMedioSinVictorias() throws Exception {
        List<Map<String, Object>> simulados = lista(api.get("/api/leaderboard", null).cuerpo()).stream()
                .filter(puesto -> Boolean.TRUE.equals(puesto.get("simulado")))
                .toList();

        assertThat(simulados).extracting(puesto -> puesto.get("mejorPartida")).containsExactly(6, 5, 4, 2, 1, 0);
        assertThat(simulados).allSatisfy(puesto -> assertThat(puesto).containsEntry("victorias", 0));
    }

    @Test
    void unaPartidaAMediasSeRetomaDespuesDeDesconectarse() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();
        EstadoPartida antes;
        try (ClienteStomp jugador = new ClienteStomp(puerto, ana.token())) {
            jugador.enviar("empezar");
            jugador.estado();
            jugador.enviar("atacar", "{\"cartas\":[0]}");
            antes = jugador.estado();
        }

        try (ClienteStomp jugador = new ClienteStomp(puerto, ana.token())) {
            jugador.enviar("retomar");

            assertThat(jugador.estado()).isEqualTo(antes);
        }
    }

    @Test
    void alAbandonarSeBorraLaPartidaGuardada() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();
        try (ClienteStomp jugador = new ClienteStomp(puerto, ana.token())) {
            jugador.enviar("empezar");
            jugador.estado();
            jugador.enviar("abandonar");
            jugador.enviar("retomar");

            assertThat(jugador.error()).isEqualTo("No tienes ninguna partida guardada");
        }
    }

    @Test
    void sinPartidaGuardadaNoHayNadaQueRetomar() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();
        try (ClienteStomp jugador = new ClienteStomp(puerto, ana.token())) {
            jugador.enviar("retomar");

            assertThat(jugador.error()).isEqualTo("No tienes ninguna partida guardada");
        }
    }

    @Test
    void unInvitadoNoPuedeRetomar() throws Exception {
        try (ClienteStomp jugador = new ClienteStomp(puerto)) {
            jugador.enviar("retomar");

            assertThat(jugador.error()).isEqualTo("Inicia sesión para retomar una partida");
        }
    }

    // El servidor tiene que cerrar la conexión con un ERROR; si no, el cliente se queda esperando.
    @Test
    void conUnTokenFalsoElServidorRechazaLaConexion() {
        assertThatThrownBy(() -> new ClienteStomp(puerto, "token-falso")).isInstanceOf(ExecutionException.class);
    }

    @Test
    void alCerrarLaSesionLaConexionAbiertaDejaDeAdmitirJugadas() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();
        try (ClienteStomp jugador = new ClienteStomp(puerto, ana.token())) {
            jugador.enviar("empezar");
            jugador.estado();

            api.post("/api/auth/salir", "{}", ana.token());
            jugador.enviar("atacar", "{\"cartas\":[0]}");

            assertThat(jugador.cerradaPorElServidor()).isTrue();
        }
    }

    private static boolean terminada(EstadoPartida estado) {
        return estado.fase() == Fase.VICTORIA || estado.fase() == Fase.DERROTA;
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> lista(String json) {
        return new tools.jackson.databind.json.JsonMapper().readValue(json, List.class);
    }
}
