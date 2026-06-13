package com.regicide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartidaRequest {
    private Boolean ganada;
    private Integer turnosJugados;
    private Integer cartasJugadas;
    private Integer enemigoActual;
    private String detallesPartida;
}
