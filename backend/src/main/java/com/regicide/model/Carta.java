package com.regicide.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Carta {
    private Integer numero;
    private String palo; // Corazones, Diamantes, Picas, Tréboles

    public Integer getValor() {
        return numero;
    }

    public Integer getVida() {
        return 0;
    }
}
