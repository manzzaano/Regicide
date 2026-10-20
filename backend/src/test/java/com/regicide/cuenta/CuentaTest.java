package com.regicide.cuenta;

import com.regicide.BaseDeDatosDePrueba;
import com.regicide.ClienteHttp;
import com.regicide.ClienteHttp.Jugador;
import com.regicide.ClienteHttp.Respuesta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;
import java.util.UUID;

import static com.regicide.ClienteHttp.CONTRASENA;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(BaseDeDatosDePrueba.class)
class CuentaTest {

    private static final String NUEVA = "otra frase de paso igual de larga";

    @LocalServerPort
    private int puerto;

    @Autowired
    private Usuarios usuarios;

    private ClienteHttp api;
    private String nombre;

    @BeforeEach
    void preparar() {
        api = new ClienteHttp(puerto);
        nombre = "ana_" + UUID.randomUUID().toString().substring(0, 8);
    }

    private Respuesta registrar(String nombre, String contrasena) throws Exception {
        return api.post("/api/auth/register", "{\"nombre\":\"" + nombre + "\",\"contrasena\":\"" + contrasena + "\"}");
    }

    private Respuesta entrar(String nombre, String contrasena) throws Exception {
        return api.post("/api/auth/login", "{\"nombre\":\"" + nombre + "\",\"contrasena\":\"" + contrasena + "\"}");
    }

    private Respuesta recuperar(String nombre, String codigo, String nueva) throws Exception {
        return api.post("/api/auth/recuperar",
                "{\"nombre\":\"" + nombre + "\",\"codigo\":\"" + codigo + "\",\"nueva\":\"" + nueva + "\"}");
    }

    private int misPartidas(String token) throws Exception {
        return api.get("/api/games/me", token).estado();
    }

    @Test
    void alRegistrarseSeRecibeUnTokenYUnCodigoDeRecuperacion() throws Exception {
        Respuesta respuesta = registrar(nombre, CONTRASENA);

        assertThat(respuesta.estado()).isEqualTo(201);
        assertThat(respuesta.campo("token")).isNotBlank();
        assertThat(respuesta.campo("codigoRecuperacion")).matches("[0-9A-Z]{4}(-[0-9A-Z]{4}){3}");
    }

    @Test
    void noSePuedeRepetirNombre() throws Exception {
        registrar(nombre, CONTRASENA);

        Respuesta respuesta = registrar(nombre, NUEVA);

        assertThat(respuesta.estado()).isEqualTo(409);
        assertThat(respuesta.campo("mensaje")).isEqualTo("Ese nombre ya está en uso");
    }

    @Test
    void elNombreSoloAdmiteLetrasNumerosYGuionesBajos() throws Exception {
        Respuesta respuesta = registrar("ana <script>", CONTRASENA);

        assertThat(respuesta.estado()).isEqualTo(400);
        assertThat(respuesta.campo("mensaje")).startsWith("El nombre debe tener");
    }

    @Test
    void laContrasenaTieneDe15A128Caracteres() throws Exception {
        assertThat(registrar(nombre, "catorce-letras").campo("mensaje"))
                .isEqualTo("La contraseña debe tener de 15 a 128 caracteres");
        assertThat(registrar(nombre, "a".repeat(129)).estado()).isEqualTo(400);
    }

    @Test
    void lasTildesCuentanComoUnCaracterYNoSeRecortan() throws Exception {
        String contrasena = "ñ".repeat(40);
        registrar(nombre, contrasena);

        assertThat(entrar(nombre, contrasena).estado()).isEqualTo(200);
        assertThat(entrar(nombre, "ñ".repeat(39)).estado()).isEqualTo(401);
    }

    @Test
    void laContrasenaNoPuedeSerElNombre() throws Exception {
        String largo = "ana_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        assertThat(registrar(largo, largo.toUpperCase()).campo("mensaje")).isEqualTo("La contraseña no puede ser tu nombre");
    }

    @Test
    void unaContrasenaFiltradaSeRechaza() throws Exception {
        Respuesta respuesta = registrar(nombre, BaseDeDatosDePrueba.CONTRASENA_FILTRADA);

        assertThat(respuesta.estado()).isEqualTo(400);
        assertThat(respuesta.campo("mensaje")).startsWith("Esa contraseña aparece en filtraciones");
    }

    @Test
    void unJsonMalFormadoEsUnError400() throws Exception {
        assertThat(api.post("/api/auth/register", "{\"nombre\":").estado()).isEqualTo(400);
    }

    @Test
    void conLaContrasenaCorrectaSeEntra() throws Exception {
        registrar(nombre, CONTRASENA);

        Respuesta respuesta = entrar(nombre, CONTRASENA);

        assertThat(respuesta.estado()).isEqualTo(200);
        assertThat(respuesta.campo("token")).isNotBlank();
    }

    @Test
    void conLaContrasenaIncorrectaNoSeEntra() throws Exception {
        registrar(nombre, CONTRASENA);

        Respuesta respuesta = entrar(nombre, NUEVA);

        assertThat(respuesta.estado()).isEqualTo(401);
        assertThat(respuesta.campo("mensaje")).isEqualTo("Nombre o contraseña incorrectos");
    }

    @Test
    void unNombreQueNoExisteDaElMismoMensaje() throws Exception {
        Respuesta respuesta = entrar(nombre, CONTRASENA);

        assertThat(respuesta.estado()).isEqualTo(401);
        assertThat(respuesta.campo("mensaje")).isEqualTo("Nombre o contraseña incorrectos");
    }

    @Test
    void conUnJugadorSimuladoNoSeEntra() throws Exception {
        assertThat(entrar("lucia_mtz", "!").estado()).isEqualTo(401);
    }

    @Test
    void trasDiezFallosSeguidosElNombreSeBloqueaAunqueLaContrasenaSeaBuena() throws Exception {
        registrar(nombre, CONTRASENA);
        for (int i = 0; i < Intentos.POR_NOMBRE; i++) {
            entrar(nombre, NUEVA);
        }

        Respuesta respuesta = entrar(nombre, CONTRASENA);

        assertThat(respuesta.estado()).isEqualTo(429);
        assertThat(respuesta.campo("mensaje")).startsWith("Demasiados intentos");
    }

    @Test
    void unaContrasenaAntiguaEnBcryptSigueValiendoYPasaAArgon2() throws Exception {
        usuarios.save(new Usuario(nombre, new BCryptPasswordEncoder().encode("antigua8")));

        assertThat(entrar(nombre, "antigua8").estado()).isEqualTo(200);
        assertThat(usuarios.findByNombre(nombre).orElseThrow().getContrasena()).startsWith("{argon2}");
        assertThat(entrar(nombre, "antigua8").estado()).isEqualTo(200);
    }

    @Test
    void entrarConUnaContrasenaDeMasDe72BytesContraUnHashBcryptNoEsUnError500() throws Exception {
        usuarios.save(new Usuario(nombre, new BCryptPasswordEncoder().encode("antigua8")));

        assertThat(entrar(nombre, "ñ".repeat(40)).estado()).isEqualTo(401);
    }

    @Test
    void alSalirElTokenDejaDeValerEnTodosLosDispositivos() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();
        String otroDispositivo = entrar(ana.nombre(), CONTRASENA).campo("token");

        assertThat(api.post("/api/auth/salir", "{}", ana.token()).estado()).isEqualTo(204);

        assertThat(misPartidas(ana.token())).isEqualTo(401);
        assertThat(misPartidas(otroDispositivo)).isEqualTo(401);
        assertThat(misPartidas(entrar(ana.nombre(), CONTRASENA).campo("token"))).isEqualTo(200);
    }

    @Test
    void cambiarLaContrasenaPideLaActualYCierraLasDemasSesiones() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();

        Respuesta mal = api.post("/api/auth/contrasena", "{\"actual\":\"" + NUEVA + "\",\"nueva\":\"" + NUEVA + "\"}", ana.token());
        assertThat(mal.estado()).isEqualTo(403);
        assertThat(mal.campo("mensaje")).isEqualTo("La contraseña actual no es correcta");

        Respuesta bien = api.post("/api/auth/contrasena", "{\"actual\":\"" + CONTRASENA + "\",\"nueva\":\"" + NUEVA + "\"}", ana.token());
        assertThat(bien.estado()).isEqualTo(200);
        assertThat(misPartidas(bien.campo("token"))).isEqualTo(200);
        assertThat(misPartidas(ana.token())).isEqualTo(401);
        assertThat(entrar(ana.nombre(), CONTRASENA).estado()).isEqualTo(401);
        assertThat(entrar(ana.nombre(), NUEVA).estado()).isEqualTo(200);
    }

    @Test
    void laContrasenaNuevaTambienCumpleLasReglas() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();

        Respuesta respuesta = api.post("/api/auth/contrasena", "{\"actual\":\"" + CONTRASENA + "\",\"nueva\":\"corta\"}", ana.token());

        assertThat(respuesta.estado()).isEqualTo(400);
        assertThat(entrar(ana.nombre(), CONTRASENA).estado()).isEqualTo(200);
    }

    @Test
    void conElCodigoDeRecuperacionSeCambiaLaContrasenaYElCodigoSeGasta() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();

        // En minúsculas y sin guiones también vale, como lo copiaría alguien a mano.
        Respuesta respuesta = recuperar(ana.nombre(), ana.codigoRecuperacion().toLowerCase().replace("-", ""), NUEVA);

        assertThat(respuesta.estado()).isEqualTo(200);
        assertThat(respuesta.campo("codigoRecuperacion")).isNotEqualTo(ana.codigoRecuperacion());
        assertThat(respuesta.json()).doesNotContainKey("token");
        assertThat(misPartidas(ana.token())).isEqualTo(401);
        assertThat(entrar(ana.nombre(), NUEVA).estado()).isEqualTo(200);
        assertThat(recuperar(ana.nombre(), ana.codigoRecuperacion(), CONTRASENA).estado()).isEqualTo(401);
        assertThat(recuperar(ana.nombre(), respuesta.campo("codigoRecuperacion"), CONTRASENA).estado()).isEqualTo(200);
    }

    @Test
    void unCodigoIncorrectoYUnNombreQueNoExisteDanElMismoMensaje() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();

        Respuesta codigoMalo = recuperar(ana.nombre(), "0000-0000-0000-0000", NUEVA);
        Respuesta sinCuenta = recuperar(nombre, "0000-0000-0000-0000", NUEVA);

        assertThat(codigoMalo.estado()).isEqualTo(401);
        assertThat(codigoMalo.cuerpo()).isEqualTo(sinCuenta.cuerpo());
        assertThat(codigoMalo.campo("mensaje")).isEqualTo("Nombre o código de recuperación incorrectos");
    }

    @Test
    void losJugadoresSimuladosNoSePuedenRecuperar() throws Exception {
        assertThat(recuperar("lucia_mtz", "0000-0000-0000-0000", NUEVA).estado()).isEqualTo(401);
    }

    @Test
    void trasDiezCodigosIncorrectosSeBloqueaLaRecuperacion() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();
        for (int i = 0; i < Intentos.POR_NOMBRE; i++) {
            recuperar(ana.nombre(), "0000-0000-0000-0000", NUEVA);
        }

        assertThat(recuperar(ana.nombre(), ana.codigoRecuperacion(), NUEVA).estado()).isEqualTo(429);
    }

    @Test
    void pedirOtroCodigoInvalidaElAnterior() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();

        Respuesta respuesta = api.post("/api/auth/codigo", "{\"contrasena\":\"" + CONTRASENA + "\"}", ana.token());

        assertThat(respuesta.estado()).isEqualTo(200);
        assertThat(recuperar(ana.nombre(), ana.codigoRecuperacion(), NUEVA).estado()).isEqualTo(401);
        assertThat(recuperar(ana.nombre(), respuesta.campo("codigoRecuperacion"), NUEVA).estado()).isEqualTo(200);
    }

    @Test
    void alBorrarLaCuentaDesapareceConSusPartidas() throws Exception {
        Jugador ana = api.registrarJugadorNuevo();

        assertThat(api.post("/api/auth/borrar", "{\"contrasena\":\"" + NUEVA + "\"}", ana.token()).estado()).isEqualTo(403);
        assertThat(api.post("/api/auth/borrar", "{\"contrasena\":\"" + CONTRASENA + "\"}", ana.token()).estado()).isEqualTo(204);

        assertThat(usuarios.existsByNombre(ana.nombre())).isFalse();
        assertThat(misPartidas(ana.token())).isEqualTo(401);
        assertThat(entrar(ana.nombre(), CONTRASENA).estado()).isEqualTo(401);
    }

    @Test
    void laApiSoloAdmiteLosOrigenesPermitidos() throws Exception {
        assertThat(origenAdmitido("http://localhost:4200")).hasValue("http://localhost:4200");
        assertThat(origenAdmitido("https://otra-web.example")).isEmpty();
    }

    private Optional<String> origenAdmitido(String origen) throws Exception {
        HttpRequest peticion = HttpRequest.newBuilder(URI.create("http://localhost:" + puerto + "/api/leaderboard"))
                .header("Origin", origen)
                .GET()
                .build();
        return HttpClient.newHttpClient().send(peticion, HttpResponse.BodyHandlers.discarding())
                .headers().firstValue("Access-Control-Allow-Origin");
    }
}
