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
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

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

    // Solo para recuperar la contraseña. Hasta que se confirma con el enlace, espera en correoPendiente.
    private String correo;

    private String correoPendiente;

    // De cada enlace se guarda su SHA-256: quien lea la base de datos no puede usarlos.
    private String enlaceCorreo;

    private Instant enlaceCorreoCaduca;

    private String enlaceContrasena;

    private Instant enlaceContrasenaCaduca;

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

    public String getCorreo() {
        return correo;
    }

    public String getCorreoPendiente() {
        return correoPendiente;
    }

    /** Guarda el correo hasta que se confirme y devuelve el enlace de confirmación; null lo quita. */
    String cambiarCorreo(String nuevo) {
        if (nuevo == null) {
            correo = null;
            correoPendiente = null;
            enlaceCorreo = null;
            return null;
        }
        correoPendiente = nuevo;
        String enlace = nuevoEnlace();
        enlaceCorreo = resumen(enlace);
        enlaceCorreoCaduca = Instant.now().plus(Duration.ofHours(24));
        return enlace;
    }

    boolean confirmarCorreo() {
        if (enlaceCorreoCaduca == null || enlaceCorreoCaduca.isBefore(Instant.now())) {
            return false;
        }
        correo = correoPendiente;
        correoPendiente = null;
        enlaceCorreo = null;
        return true;
    }

    /** Enlace para poner una contraseña nueva, válido 30 minutos y una sola vez. */
    String nuevoEnlaceContrasena() {
        String enlace = nuevoEnlace();
        enlaceContrasena = resumen(enlace);
        enlaceContrasenaCaduca = Instant.now().plus(Duration.ofMinutes(30));
        return enlace;
    }

    boolean gastarEnlaceContrasena() {
        boolean vigente = enlaceContrasenaCaduca != null && enlaceContrasenaCaduca.isAfter(Instant.now());
        enlaceContrasena = null;
        return vigente;
    }

    private static final SecureRandom AZAR = new SecureRandom();

    // 256 bits en base64 sin relleno, que caben en una URL.
    private static String nuevoEnlace() {
        byte[] bytes = new byte[32];
        AZAR.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String resumen(String enlace) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(enlace.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException imposible) {
            throw new IllegalStateException(imposible);
        }
    }
}
