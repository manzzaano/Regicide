package com.regicide.partida;

import com.regicide.juego.Fase;
import com.regicide.juego.Partida;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * El resultado de las partidas que termina un invitado, apartado un rato bajo un código
 * aleatorio. Si después entra o crea una cuenta, el navegador canjea el código y la partida pasa
 * a su historial. El resultado no lo manda el navegador, así que no se puede inventar.
 */
@Component
class PartidasPorReclamar {

    record Resultado(Fase fase, int enemigosDerrotados, int comodinesUsados, Instant caduca) {
    }

    static final Duration VIGENCIA = Duration.ofHours(1);
    // Tope de memoria: si alguien termina partidas sin parar, las que pasen de aquí no se apartan.
    private static final int MAXIMO = 10_000;

    private final Map<String, Resultado> porCodigo = new ConcurrentHashMap<>();
    private final SecureRandom azar = new SecureRandom();

    /** Devuelve el código, o null si ya hay demasiadas apartadas. */
    String apartar(Partida partida) {
        Instant ahora = Instant.now();
        porCodigo.values().removeIf(resultado -> resultado.caduca().isBefore(ahora));
        if (porCodigo.size() >= MAXIMO) {
            return null;
        }
        byte[] bytes = new byte[32];
        azar.nextBytes(bytes);
        String codigo = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        porCodigo.put(codigo, new Resultado(partida.fase(), 12 - partida.castillo().size(), 2 - partida.comodines(),
                ahora.plus(VIGENCIA)));
        return codigo;
    }

    /** Cada código sirve una sola vez. */
    Optional<Resultado> canjear(String codigo) {
        return Optional.ofNullable(codigo == null ? null : porCodigo.remove(codigo))
                .filter(resultado -> resultado.caduca().isAfter(Instant.now()));
    }
}
