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
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static com.regicide.ClienteHttp.CONTRASENA;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import({BaseDeDatosDePrueba.class, CorreosDePrueba.class})
class CuentaTest {

    private static final String NUEVA = "otra frase de paso igual de larga";

    @LocalServerPort
    private int puerto;

    @Autowired
    private Usuarios usuarios;

    @Autowired
    private CorreosDePrueba.Buzon buzon;

    private ClienteHttp api;
    private String nombre;
    private String correo;

    @BeforeEach
    void preparar() {
        api = new ClienteHttp(puerto);
        nombre = "ana_" + UUID.randomUUID().toString().substring(0, 8);
        correo = nombre + "@example.com";
    }

    private Respuesta registrar(String nombre, String contrasena) throws Exception {
        return api.post("/api/auth/register", "{\"nombre\":\"" + nombre + "\",\"contrasena\":\"" + contrasena + "\"}");
    }

    private Respuesta entrar(String nombre, String contrasena) throws Exception {
        return api.post("/api/auth/login", "{\"nombre\":\"" + nombre + "\",\"contrasena\":\"" + contrasena + "\"}");
    }

    private Respuesta registrar(String nombre, String contrasena, String correo) throws Exception {
        return api.post("/api/auth/register", "{\"nombre\":\"" + nombre + "\",\"contrasena\":\"" + contrasena
                + "\",\"correo\":\"" + correo + "\"}");
    }

    private Respuesta confirmar(String enlace) throws Exception {
        return api.post("/api/auth/correo/confirmar", "{\"enlace\":\"" + enlace + "\"}");
    }

    private Respuesta olvide(String nombre) throws Exception {
        return api.post("/api/auth/olvide", "{\"nombre\":\"" + nombre + "\"}");
    }

    private Respuesta restablecer(String enlace, String nueva) throws Exception {
        return api.post("/api/auth/restablecer", "{\"enlace\":\"" + enlace + "\",\"nueva\":\"" + nueva + "\"}");
    }

    private Map<String, Object> cuenta(String token) throws Exception {
        return api.get("/api/auth/cuenta", token).json();
    }

    /** Registra a la jugadora con su correo ya confirmado y devuelve su token. */
    private String conCorreoConfirmado() throws Exception {
        registrar(nombre, CONTRASENA, correo);
        confirmar(ultimo().enlace());
        return entrar(nombre, CONTRASENA).campo("token");
    }

    private CorreosDePrueba.Enviado ultimo() {
        return buzon.para(correo).getLast();
    }

    private int misPartidas(String token) throws Exception {
        return api.get("/api/games/me", token).estado();
    }

    @Test
    void alRegistrarseSeRecibeUnTokenYElCorreoEsOpcional() throws Exception {
        Respuesta respuesta = registrar(nombre, CONTRASENA);

        assertThat(respuesta.estado()).isEqualTo(201);
        assertThat(respuesta.campo("token")).isNotBlank();
        assertThat(cuenta(respuesta.campo("token"))).containsEntry("correo", null).containsEntry("correoPendiente", null);
    }

    @Test
    void unNombreOfensivoSeRechaza() throws Exception {
        Respuesta respuesta = registrar("p0lla" + nombre, CONTRASENA);

        assertThat(respuesta.estado()).isEqualTo(400);
        assertThat(respuesta.campo("mensaje")).isEqualTo("Ese nombre no está permitido. Elige otro.");
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
    void enInglesLosErroresYLosCorreosLleganEnIngles() throws Exception {
        ClienteHttp ingles = api.enIngles();

        assertThat(ingles.post("/api/auth/register", "{\"nombre\":\"a b\",\"contrasena\":\"" + CONTRASENA + "\"}")
                .campo("mensaje")).isEqualTo("The name must have 3 to 20 letters, numbers or underscores");
        assertThat(ingles.post("/api/auth/register", "{\"nombre\":\"" + nombre + "\",\"contrasena\":\"corta\"}")
                .campo("mensaje")).isEqualTo("The password must have 15 to 128 characters");

        ingles.post("/api/auth/register", "{\"nombre\":\"" + nombre + "\",\"contrasena\":\"" + CONTRASENA
                + "\",\"correo\":\"" + correo + "\"}");

        assertThat(ultimo().asunto()).isEqualTo("Confirm your email on Regicide");
        assertThat(ultimo().texto()).startsWith("Hi " + nombre + ",");
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
    void elCorreoNoCuentaHastaQueSeConfirmaConElEnlace() throws Exception {
        registrar(nombre, CONTRASENA, correo);
        String token = entrar(nombre, CONTRASENA).campo("token");
        assertThat(cuenta(token)).containsEntry("correo", null).containsEntry("correoPendiente", correo);

        String enlace = buzon.para(correo).getFirst().enlace();

        assertThat(confirmar(enlace).estado()).isEqualTo(204);
        assertThat(cuenta(token)).containsEntry("correo", correo).containsEntry("correoPendiente", null);
        assertThat(confirmar(enlace).campo("mensaje")).isEqualTo("El enlace no es válido o ha caducado. Pide otro.");
    }

    @Test
    void unCorreoMalEscritoSeRechaza() throws Exception {
        Respuesta respuesta = registrar(nombre, CONTRASENA, "ana.example.com");

        assertThat(respuesta.estado()).isEqualTo(400);
        assertThat(respuesta.campo("mensaje")).isEqualTo("El correo no es válido");
    }

    @Test
    void conElEnlaceDelCorreoSePoneOtraContrasenaYSeCierranLasSesiones() throws Exception {
        String token = conCorreoConfirmado();

        assertThat(olvide(nombre).estado()).isEqualTo(202);
        String enlace = ultimo().enlace();

        assertThat(restablecer(enlace, "corta").estado()).isEqualTo(400);
        assertThat(restablecer(enlace, NUEVA).estado()).isEqualTo(204);
        assertThat(misPartidas(token)).isEqualTo(401);
        assertThat(entrar(nombre, NUEVA).estado()).isEqualTo(200);
        assertThat(ultimo().asunto()).isEqualTo("Tu contraseña de Regicide ha cambiado");
        assertThat(restablecer(enlace, CONTRASENA).estado()).isEqualTo(400);
    }

    @Test
    void sinCorreoConfirmadoNoSeEnviaNadaYLaRespuestaEsLaMisma() throws Exception {
        registrar(nombre, CONTRASENA, correo);
        Respuesta sinConfirmar = olvide(nombre);
        Respuesta sinCuenta = olvide("nadie_" + nombre);

        assertThat(sinConfirmar.estado()).isEqualTo(202);
        assertThat(sinConfirmar.cuerpo()).isEqualTo(sinCuenta.cuerpo());
        assertThat(buzon.para(correo)).extracting(CorreosDePrueba.Enviado::asunto)
                .containsExactly("Confirma tu correo en Regicide");
    }

    @Test
    void comoMuchoTresEnlacesPorNombreCadaQuinceMinutos() throws Exception {
        conCorreoConfirmado();
        for (int i = 0; i < 5; i++) {
            assertThat(olvide(nombre).estado()).isEqualTo(202);
        }

        assertThat(buzon.para(correo)).filteredOn(enviado -> enviado.asunto().startsWith("Restablece")).hasSize(3);
    }

    @Test
    void cambiarOQuitarElCorreoPideLaContrasenaYAvisaAlAnterior() throws Exception {
        String token = conCorreoConfirmado();

        assertThat(api.post("/api/auth/correo", "{\"correo\":\"\",\"contrasena\":\"" + NUEVA + "\"}", token).estado())
                .isEqualTo(403);
        Respuesta respuesta = api.post("/api/auth/correo", "{\"correo\":\"\",\"contrasena\":\"" + CONTRASENA + "\"}", token);

        assertThat(respuesta.json()).containsEntry("correo", null);
        assertThat(ultimo().asunto()).isEqualTo("Has quitado el correo de tu cuenta de Regicide");
    }

    @Test
    void alCambiarLaContrasenaSeAvisaPorCorreo() throws Exception {
        String token = conCorreoConfirmado();

        api.post("/api/auth/contrasena", "{\"actual\":\"" + CONTRASENA + "\",\"nueva\":\"" + NUEVA + "\"}", token);

        assertThat(ultimo().asunto()).isEqualTo("Tu contraseña de Regicide ha cambiado");
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
