package com.regicide.cuenta;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String contrasena;

    private Instant creadoEn;

    protected Usuario() {
    }

    Usuario(String nombre, String contrasenaCifrada) {
        this.nombre = nombre;
        this.contrasena = contrasenaCifrada;
        this.creadoEn = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    String getContrasena() {
        return contrasena;
    }
}
