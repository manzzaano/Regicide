package com.regicide.partida;

import com.regicide.cuenta.Usuario;
import com.regicide.juego.Fase;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

/** Una partida terminada de un jugador con cuenta. De aquí sale la clasificación. */
@Entity
@Table(name = "partidas_jugadas")
class PartidaJugada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    private Fase resultado;

    private int enemigosDerrotados;

    private int comodinesUsados;

    private Instant terminadaEn;

    protected PartidaJugada() {
    }

    PartidaJugada(Usuario usuario, Fase resultado, int enemigosDerrotados, int comodinesUsados) {
        this.usuario = usuario;
        this.resultado = resultado;
        this.enemigosDerrotados = enemigosDerrotados;
        this.comodinesUsados = comodinesUsados;
        this.terminadaEn = Instant.now();
    }

    Fase getResultado() {
        return resultado;
    }

    int getEnemigosDerrotados() {
        return enemigosDerrotados;
    }

    int getComodinesUsados() {
        return comodinesUsados;
    }

    Instant getTerminadaEn() {
        return terminadaEn;
    }
}
