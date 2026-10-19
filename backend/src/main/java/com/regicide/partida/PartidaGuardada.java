package com.regicide.partida;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

/** La partida a medias de un jugador con cuenta, guardada tras cada jugada. */
@Entity
@Table(name = "partidas_guardadas")
class PartidaGuardada {

    @Id
    private Long usuarioId;

    @JdbcTypeCode(SqlTypes.JSON)
    private String estado;

    private Instant guardadaEn;

    protected PartidaGuardada() {
    }

    PartidaGuardada(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    String getEstado() {
        return estado;
    }

    void actualizar(String estado) {
        this.estado = estado;
        this.guardadaEn = Instant.now();
    }
}
