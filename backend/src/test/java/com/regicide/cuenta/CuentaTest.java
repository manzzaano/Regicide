package com.regicide.cuenta;

import com.regicide.BaseDeDatosDePrueba;
import com.regicide.ClienteHttp;
import com.regicide.ClienteHttp.Respuesta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(BaseDeDatosDePrueba.class)
class CuentaTest {

    @LocalServerPort
    private int puerto;

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

    @Test
    void alRegistrarseSeRecibeUnToken() throws Exception {
        Respuesta respuesta = registrar(nombre, "contrasena-segura");

        assertThat(respuesta.estado()).isEqualTo(201);
        assertThat(respuesta.campo("token")).isNotBlank();
    }

    @Test
    void noSePuedeRepetirNombre() throws Exception {
        registrar(nombre, "contrasena-segura");

        Respuesta respuesta = registrar(nombre, "otra-contrasena");

        assertThat(respuesta.estado()).isEqualTo(409);
        assertThat(respuesta.campo("mensaje")).isEqualTo("Ese nombre ya está en uso");
    }

    @Test
    void elNombreSoloAdmiteLetrasNumerosYGuionesBajos() throws Exception {
        Respuesta respuesta = registrar("ana <script>", "contrasena-segura");

        assertThat(respuesta.estado()).isEqualTo(400);
        assertThat(respuesta.campo("mensaje")).startsWith("El nombre debe tener");
    }

    @Test
    void laContrasenaTieneAlMenosOchoCaracteres() throws Exception {
        Respuesta respuesta = registrar(nombre, "corta");

        assertThat(respuesta.estado()).isEqualTo(400);
        assertThat(respuesta.campo("mensaje")).startsWith("La contraseña debe tener");
    }

    @Test
    void unJsonMalFormadoEsUnError400() throws Exception {
        assertThat(api.post("/api/auth/register", "{\"nombre\":").estado()).isEqualTo(400);
    }

    @Test
    void unaContrasenaDeMasDe72BytesSeRechaza() throws Exception {
        Respuesta respuesta = registrar(nombre, "ñ".repeat(40));

        assertThat(respuesta.estado()).isEqualTo(400);
        assertThat(respuesta.campo("mensaje")).isEqualTo("La contraseña es demasiado larga");
    }

    @Test
    void entrarConUnaContrasenaDeMasDe72BytesNoEsUnError500() throws Exception {
        registrar(nombre, "contrasena-segura");

        assertThat(entrar(nombre, "ñ".repeat(40)).estado()).isEqualTo(401);
    }

    @Test
    void conLaContrasenaCorrectaSeEntra() throws Exception {
        registrar(nombre, "contrasena-segura");

        Respuesta respuesta = entrar(nombre, "contrasena-segura");

        assertThat(respuesta.estado()).isEqualTo(200);
        assertThat(respuesta.campo("token")).isNotBlank();
    }

    @Test
    void conLaContrasenaIncorrectaNoSeEntra() throws Exception {
        registrar(nombre, "contrasena-segura");

        Respuesta respuesta = entrar(nombre, "contrasena-mala");

        assertThat(respuesta.estado()).isEqualTo(401);
        assertThat(respuesta.campo("mensaje")).isEqualTo("Nombre o contraseña incorrectos");
    }

    @Test
    void conUnJugadorSimuladoNoSeEntra() throws Exception {
        assertThat(entrar("lucia_mtz", "!").estado()).isEqualTo(401);
    }

    @Test
    void unNombreQueNoExisteDaElMismoMensaje() throws Exception {
        Respuesta respuesta = entrar(nombre, "contrasena-segura");

        assertThat(respuesta.estado()).isEqualTo(401);
        assertThat(respuesta.campo("mensaje")).isEqualTo("Nombre o contraseña incorrectos");
    }
}
