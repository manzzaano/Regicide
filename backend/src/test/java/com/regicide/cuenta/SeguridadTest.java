package com.regicide.cuenta;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.regicide.BaseDeDatosDePrueba;
import com.regicide.ClienteHttp;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(BaseDeDatosDePrueba.class)
class SeguridadTest {

    @LocalServerPort
    private int puerto;

    @Autowired
    private JwtEncoder encoder;

    private ClienteHttp api;

    @BeforeEach
    void preparar() {
        api = new ClienteHttp(puerto);
    }

    private static String token(JwtEncoder encoder, String nombre, Instant caduca) {
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(nombre)
                .issuedAt(caduca.minus(Duration.ofHours(1)))
                .expiresAt(caduca)
                .build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
    }

    @Test
    void laClasificacionEsPublica() throws Exception {
        assertThat(api.get("/api/leaderboard", null).estado()).isEqualTo(200);
    }

    @Test
    void misPartidasPideToken() throws Exception {
        assertThat(api.get("/api/games/me", null).estado()).isEqualTo(401);
    }

    @Test
    void conUnTokenValidoSeVenMisPartidas() throws Exception {
        String token = api.registrarJugadorNuevo().token();

        assertThat(api.get("/api/games/me", token).estado()).isEqualTo(200);
    }

    @Test
    void unTokenCaducadoNoVale() throws Exception {
        String nombre = api.registrarJugadorNuevo().nombre();
        String caducado = token(encoder, nombre, Instant.now().minus(Duration.ofMinutes(5)));

        assertThat(api.get("/api/games/me", caducado).estado()).isEqualTo(401);
    }

    @Test
    void unTokenFirmadoConOtraClaveNoVale() throws Exception {
        String nombre = api.registrarJugadorNuevo().nombre();
        byte[] otraClave = "otra-clave-que-no-es-la-del-servidor-32b".getBytes(StandardCharsets.UTF_8);
        JwtEncoder falsificador = new NimbusJwtEncoder(new ImmutableSecret<>(new SecretKeySpec(otraClave, "HmacSHA256")));
        String falso = token(falsificador, nombre, Instant.now().plus(Duration.ofHours(1)));

        assertThat(api.get("/api/games/me", falso).estado()).isEqualTo(401);
    }

    @Test
    void laClasificacionSeVeAunqueElTokenHayaCaducado() throws Exception {
        String nombre = api.registrarJugadorNuevo().nombre();
        String caducado = token(encoder, nombre, Instant.now().minus(Duration.ofMinutes(5)));

        assertThat(api.get("/api/leaderboard", caducado).estado()).isEqualTo(200);
    }

    @Test
    void cualquierOtraRutaPideToken() throws Exception {
        assertThat(api.get("/api/otra", null).estado()).isEqualTo(401);
    }
}
