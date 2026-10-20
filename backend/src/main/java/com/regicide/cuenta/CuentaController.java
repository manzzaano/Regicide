package com.regicide.cuenta;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.function.Function;

@RestController
@RequestMapping("/api/auth")
class CuentaController {

    record Registro(
            @NotNull(message = "Falta el nombre")
            @Pattern(regexp = "[A-Za-z0-9_]{3,20}", message = "El nombre debe tener de 3 a 20 letras, números o guiones bajos")
            String nombre,
            String contrasena) {
    }

    record Credenciales(String nombre, String contrasena) {
    }

    record CambioDeContrasena(String actual, String nueva) {
    }

    record Confirmacion(String contrasena) {
    }

    record Recuperacion(String nombre, String codigo, String nueva) {
    }

    record Token(String token) {
    }

    record CuentaNueva(String token, String codigoRecuperacion) {
    }

    record CodigoRecuperacion(String codigoRecuperacion) {
    }

    record Mensaje(String mensaje) {
    }

    private final Usuarios usuarios;
    private final PasswordEncoder cifrado;
    private final Tokens tokens;
    private final Contrasenas contrasenas;
    private final Intentos intentos;
    // Con un nombre que no existe se compara igual contra este hash, para que la respuesta tarde
    // lo mismo y no delate qué nombres tienen cuenta.
    private final String hashDeNadie;

    CuentaController(Usuarios usuarios, PasswordEncoder cifrado, Tokens tokens, Contrasenas contrasenas,
                     Intentos intentos) {
        this.usuarios = usuarios;
        this.cifrado = cifrado;
        this.tokens = tokens;
        this.contrasenas = contrasenas;
        this.intentos = intentos;
        this.hashDeNadie = cifrado.encode("contrasena-de-un-usuario-que-no-existe");
    }

    // ponytail: comprobar y guardar no es atómico; si dos registros con el mismo nombre se
    // cruzan, la restricción unique de la tabla frena al segundo con un 500 en vez de un 409.
    @PostMapping("/register")
    ResponseEntity<?> registrar(@Valid @RequestBody Registro registro, HttpServletRequest peticion) {
        Optional<String> problema = contrasenas.problema(registro.nombre(), registro.contrasena());
        if (problema.isPresent()) {
            return ResponseEntity.badRequest().body(new Mensaje(problema.get()));
        }
        // Decir que el nombre está ocupado no filtra nada: los nombres ya se ven en la clasificación.
        if (usuarios.existsByNombre(registro.nombre())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new Mensaje("Ese nombre ya está en uso"));
        }
        if (!intentos.registrar(peticion.getRemoteAddr())) {
            return demasiados();
        }
        Usuario usuario = new Usuario(registro.nombre(), cifrado.encode(registro.contrasena()));
        String codigo = usuario.nuevoCodigoRecuperacion();
        usuarios.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CuentaNueva(tokens.emitir(usuario), codigo));
    }

    @PostMapping("/login")
    ResponseEntity<?> entrar(@RequestBody Credenciales credenciales, HttpServletRequest peticion) {
        String ip = peticion.getRemoteAddr();
        String nombre = String.valueOf(credenciales.nombre());
        if (intentos.agotadosPorIp(ip) || intentos.agotadosPorNombre(nombre)) {
            return demasiados();
        }
        Optional<Usuario> encontrado = conContrasena(credenciales.nombre(), credenciales.contrasena());
        if (encontrado.isEmpty()) {
            intentos.fallo(nombre, ip);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new Mensaje("Nombre o contraseña incorrectos"));
        }
        Usuario usuario = encontrado.get();
        intentos.acierto(nombre);
        if (cifrado.upgradeEncoding(usuario.getContrasena())) {
            usuario.setContrasena(cifrado.encode(credenciales.contrasena()));
            usuarios.save(usuario);
        }
        return ResponseEntity.ok(new Token(tokens.emitir(usuario)));
    }

    /** Cierra la sesión en todos los dispositivos: ningún token emitido hasta ahora vuelve a valer. */
    @PostMapping("/salir")
    ResponseEntity<Void> salir(@AuthenticationPrincipal Jwt jwt) {
        Usuario usuario = usuarios.findByNombre(jwt.getSubject()).orElseThrow();
        usuario.cerrarSesiones();
        usuarios.save(usuario);
        return ResponseEntity.noContent().build();
    }

    /** Cambia la contraseña y cierra las demás sesiones; este dispositivo sigue dentro con el token nuevo. */
    @PostMapping("/contrasena")
    ResponseEntity<?> cambiarContrasena(@AuthenticationPrincipal Jwt jwt, @RequestBody CambioDeContrasena cambio,
                                        HttpServletRequest peticion) {
        return conContrasenaActual(jwt, cambio.actual(), peticion, usuario -> {
            Optional<String> problema = contrasenas.problema(usuario.getNombre(), cambio.nueva());
            if (problema.isPresent()) {
                return ResponseEntity.badRequest().body(new Mensaje(problema.get()));
            }
            usuario.setContrasena(cifrado.encode(cambio.nueva()));
            usuario.cerrarSesiones();
            usuarios.save(usuario);
            return ResponseEntity.ok(new Token(tokens.emitir(usuario)));
        });
    }

    /** Un código de recuperación nuevo; el anterior deja de valer. */
    @PostMapping("/codigo")
    ResponseEntity<?> nuevoCodigo(@AuthenticationPrincipal Jwt jwt, @RequestBody Confirmacion confirmacion,
                                  HttpServletRequest peticion) {
        return conContrasenaActual(jwt, confirmacion.contrasena(), peticion, usuario -> {
            String codigo = usuario.nuevoCodigoRecuperacion();
            usuarios.save(usuario);
            return ResponseEntity.ok(new CodigoRecuperacion(codigo));
        });
    }

    /** Borra la cuenta; la base de datos borra en cascada sus partidas. */
    @PostMapping("/borrar")
    ResponseEntity<?> borrar(@AuthenticationPrincipal Jwt jwt, @RequestBody Confirmacion confirmacion,
                             HttpServletRequest peticion) {
        return conContrasenaActual(jwt, confirmacion.contrasena(), peticion, usuario -> {
            usuarios.delete(usuario);
            return ResponseEntity.noContent().build();
        });
    }

    /*
     * Sin correo, el código de recuperación es la única forma de volver a entrar sin la contraseña.
     * Se gasta al usarlo: la respuesta trae uno nuevo y no inicia sesión, hay que entrar con la
     * contraseña nueva. La contraseña se comprueba antes que el código para no dar pistas sobre él.
     */
    @PostMapping("/recuperar")
    ResponseEntity<?> recuperar(@RequestBody Recuperacion recuperacion, HttpServletRequest peticion) {
        String ip = peticion.getRemoteAddr();
        String nombre = String.valueOf(recuperacion.nombre());
        if (intentos.agotadosPorIp(ip) || intentos.agotadosPorNombre(nombre)) {
            return demasiados();
        }
        Optional<String> problema = contrasenas.problema(nombre, recuperacion.nueva());
        if (problema.isPresent()) {
            return ResponseEntity.badRequest().body(new Mensaje(problema.get()));
        }
        Optional<Usuario> encontrado = usuarios.findByNombre(nombre)
                .filter(u -> recuperacion.codigo() != null && u.codigoRecuperacionValido(recuperacion.codigo()));
        if (encontrado.isEmpty()) {
            intentos.fallo(nombre, ip);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new Mensaje("Nombre o código de recuperación incorrectos"));
        }
        Usuario usuario = encontrado.get();
        intentos.acierto(nombre);
        usuario.setContrasena(cifrado.encode(recuperacion.nueva()));
        usuario.cerrarSesiones();
        String codigo = usuario.nuevoCodigoRecuperacion();
        usuarios.save(usuario);
        return ResponseEntity.ok(new CodigoRecuperacion(codigo));
    }

    // Cambiar la contraseña o el código y borrar la cuenta piden la contraseña actual: un token
    // robado no basta. Los fallos cuentan igual que los del login.
    private ResponseEntity<?> conContrasenaActual(Jwt jwt, String contrasena, HttpServletRequest peticion,
                                                  Function<Usuario, ResponseEntity<?>> accion) {
        String nombre = jwt.getSubject();
        if (intentos.agotadosPorNombre(nombre)) {
            return demasiados();
        }
        Optional<Usuario> usuario = conContrasena(nombre, contrasena);
        if (usuario.isEmpty()) {
            intentos.fallo(nombre, peticion.getRemoteAddr());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new Mensaje("La contraseña actual no es correcta"));
        }
        intentos.acierto(nombre);
        return accion.apply(usuario.get());
    }

    private Optional<Usuario> conContrasena(String nombre, String contrasena) {
        if (nombre == null || contrasena == null || contrasena.length() > 256) {
            return Optional.empty();
        }
        Optional<Usuario> usuario = usuarios.findByNombre(nombre);
        String hash = usuario.map(Usuario::getContrasena).orElse(hashDeNadie);
        return coincide(contrasena, hash) ? usuario : Optional.empty();
    }

    // BCrypt lanza una excepción con más de 72 bytes, y las cuentas antiguas aún tienen ese hash.
    private boolean coincide(String contrasena, String hash) {
        try {
            return cifrado.matches(contrasena, hash);
        } catch (IllegalArgumentException demasiadoLarga) {
            return false;
        }
    }

    private static ResponseEntity<?> demasiados() {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new Mensaje("Demasiados intentos. Espera unos minutos y vuelve a probar."));
    }
}
