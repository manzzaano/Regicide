package com.regicide.cuenta;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/auth")
class CuentaController {

    record Registro(
            @NotNull(message = "Falta el nombre")
            @Pattern(regexp = "[A-Za-z0-9_]{3,20}", message = "El nombre debe tener de 3 a 20 letras, números o guiones bajos")
            String nombre,
            @NotNull(message = "Falta la contraseña")
            @Size(min = 8, max = 72, message = "La contraseña debe tener de 8 a 72 caracteres")
            String contrasena) {
    }

    record Credenciales(String nombre, String contrasena) {
    }

    record Token(String token) {
    }

    record Mensaje(String mensaje) {
    }

    private final Usuarios usuarios;
    private final PasswordEncoder cifrado;
    private final Tokens tokens;

    CuentaController(Usuarios usuarios, PasswordEncoder cifrado, Tokens tokens) {
        this.usuarios = usuarios;
        this.cifrado = cifrado;
        this.tokens = tokens;
    }

    // ponytail: comprobar y guardar no es atómico; si dos registros con el mismo nombre se
    // cruzan, la restricción unique de la tabla frena al segundo con un 500 en vez de un 409.
    @PostMapping("/register")
    ResponseEntity<?> registrar(@Valid @RequestBody Registro registro) {
        if (demasiadoLarga(registro.contrasena())) {
            return ResponseEntity.badRequest().body(new Mensaje("La contraseña es demasiado larga"));
        }
        if (usuarios.existsByNombre(registro.nombre())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new Mensaje("Ese nombre ya está en uso"));
        }
        usuarios.save(new Usuario(registro.nombre(), cifrado.encode(registro.contrasena())));
        return ResponseEntity.status(HttpStatus.CREATED).body(new Token(tokens.emitir(registro.nombre())));
    }

    @PostMapping("/login")
    ResponseEntity<?> entrar(@RequestBody Credenciales credenciales) {
        if (credenciales.nombre() == null || credenciales.contrasena() == null
                || demasiadoLarga(credenciales.contrasena())) {
            return incorrectas();
        }
        return usuarios.findByNombre(credenciales.nombre())
                .filter(usuario -> cifrado.matches(credenciales.contrasena(), usuario.getContrasena()))
                .<ResponseEntity<?>>map(usuario -> ResponseEntity.ok(new Token(tokens.emitir(usuario.getNombre()))))
                .orElseGet(CuentaController::incorrectas);
    }

    // BCrypt solo admite 72 bytes y lanza una excepción con más; con tildes o eñes, 72 caracteres pueden pasarse.
    private static boolean demasiadoLarga(String contrasena) {
        return contrasena.getBytes(StandardCharsets.UTF_8).length > 72;
    }

    // El mismo mensaje si falla el nombre o la contraseña: no se dice cuál de los dos está mal.
    private static ResponseEntity<?> incorrectas() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new Mensaje("Nombre o contraseña incorrectos"));
    }
}
