package com.regicide.cuenta;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String contrasena;

    private Instant creadoEn;

    // Solo los jugadores de ejemplo de la migración V3; nadie se registra como simulado.
    private boolean simulado;

    private int versionSesion;

    // SHA-256 del código; el código en claro solo lo ve el jugador una vez.
    private String codigoRecuperacion;

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

    void setContrasena(String contrasenaCifrada) {
        this.contrasena = contrasenaCifrada;
    }

    public int getVersionSesion() {
        return versionSesion;
    }

    /** Invalida todos los tokens emitidos hasta ahora. */
    void cerrarSesiones() {
        versionSesion++;
    }

    /** Genera un código de recuperación nuevo, que sustituye al anterior, y lo devuelve en claro. */
    String nuevoCodigoRecuperacion() {
        StringBuilder codigo = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            if (i > 0 && i % 4 == 0) {
                codigo.append('-');
            }
            codigo.append(ALFABETO.charAt(AZAR.nextInt(ALFABETO.length())));
        }
        codigoRecuperacion = resumen(codigo.toString());
        return codigo.toString();
    }

    boolean codigoRecuperacionValido(String codigo) {
        return codigoRecuperacion != null && MessageDigest.isEqual(
                codigoRecuperacion.getBytes(StandardCharsets.US_ASCII),
                resumen(codigo).getBytes(StandardCharsets.US_ASCII));
    }

    // Base32 de Crockford: 16 caracteres son 80 bits. Sin I, L, O ni U para que no se confundan al copiarlo.
    private static final String ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    private static final SecureRandom AZAR = new SecureRandom();

    // Mayúsculas o minúsculas, con o sin guiones, y O, I o L leídas como 0 y 1.
    private static String resumen(String codigo) {
        String normalizado = codigo.toUpperCase(Locale.ROOT).replaceAll("[^0-9A-Z]", "")
                .replace('O', '0').replace('I', '1').replace('L', '1');
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(normalizado.getBytes(StandardCharsets.US_ASCII));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException imposible) {
            throw new IllegalStateException(imposible);
        }
    }
}
