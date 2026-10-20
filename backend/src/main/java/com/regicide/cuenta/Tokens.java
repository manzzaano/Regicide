package com.regicide.cuenta;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

/** Emite el JWT con el que el jugador se identifica en la API y en el WebSocket. */
@Component
class Tokens {

    private final JwtEncoder encoder;
    private final Duration duracion;

    Tokens(JwtEncoder encoder, @Value("${regicide.jwt.duracion}") Duration duracion) {
        this.encoder = encoder;
        this.duracion = duracion;
    }

    static final String SESION = "sesion";

    String emitir(Usuario usuario) {
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(usuario.getNombre())
                .claim(SESION, usuario.getVersionSesion())
                .issuedAt(ahora)
                .expiresAt(ahora.plus(duracion))
                .build();
        JwsHeader cabecera = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(cabecera, claims)).getTokenValue();
    }
}
