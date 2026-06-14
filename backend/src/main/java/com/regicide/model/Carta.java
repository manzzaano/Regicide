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
        return numero; // Vida = numero para enemigos
    }

    public Integer getDano() {
        return numero; // Daño = numero
    }

    public void setDano(Integer daño) {
        this.numero = daño;
    }
}
