package com.regicide.partida;

import com.regicide.cuenta.Usuario;
import com.regicide.cuenta.Usuarios;
import com.regicide.juego.Instantanea;
import com.regicide.juego.Partida;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.util.Optional;

/** Lo que se guarda de las partidas de los jugadores con cuenta. */
@Service
@Transactional
class Historial {

    private final Usuarios usuarios;
    private final PartidasGuardadas guardadas;
    private final PartidasJugadas jugadas;
    private final JsonMapper json;

    Historial(Usuarios usuarios, PartidasGuardadas guardadas, PartidasJugadas jugadas, JsonMapper json) {
        this.usuarios = usuarios;
        this.guardadas = guardadas;
        this.jugadas = jugadas;
        this.json = json;
    }

    void guardar(String nombre, Partida partida) {
        Long usuarioId = usuario(nombre).getId();
        PartidaGuardada guardada = guardadas.findById(usuarioId).orElseGet(() -> new PartidaGuardada(usuarioId));
        guardada.actualizar(json.writeValueAsString(partida.instantanea()));
        guardadas.save(guardada);
    }

    @Transactional(readOnly = true)
    Optional<Instantanea> recuperar(String nombre) {
        return guardadas.findById(usuario(nombre).getId())
                .map(guardada -> json.readValue(guardada.getEstado(), Instantanea.class));
    }

    void borrarGuardada(String nombre) {
        guardadas.deleteById(usuario(nombre).getId());
    }

    void registrarFin(String nombre, Partida partida) {
        Usuario usuario = usuario(nombre);
        int enemigosDerrotados = 12 - partida.castillo().size();
        jugadas.save(new PartidaJugada(usuario, partida.fase(), enemigosDerrotados, 2 - partida.comodines()));
        guardadas.deleteById(usuario.getId());
    }

    /** Una partida que el jugador terminó como invitado, antes de entrar. */
    void registrarReclamada(String nombre, PartidasPorReclamar.Resultado resultado) {
        jugadas.save(new PartidaJugada(usuario(nombre), resultado.fase(), resultado.enemigosDerrotados(),
                resultado.comodinesUsados()));
    }

    private Usuario usuario(String nombre) {
        return usuarios.findByNombre(nombre)
                .orElseThrow(() -> new IllegalStateException("Token de un usuario que no existe: " + nombre));
    }
}
