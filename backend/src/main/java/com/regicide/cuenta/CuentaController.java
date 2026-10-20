package com.regicide.cuenta;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
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
            String contrasena,
            @Email(message = "El correo no es válido") @Size(max = 254, message = "El correo no es válido")
            String correo) {
    }

    record Credenciales(String nombre, String contrasena) {
    }

    record CambioDeContrasena(String actual, String nueva) {
    }

    record CambioDeCorreo(
            @Email(message = "El correo no es válido") @Size(max = 254, message = "El correo no es válido")
            String correo,
            String contrasena) {
    }

    record Confirmacion(String contrasena) {
    }

    record Olvido(String nombre) {
    }

    record Enlace(String enlace) {
    }

    record Restablecimiento(String enlace, String nueva) {
    }

    record Token(String token) {
    }

    record DatosDeCuenta(String nombre, String correo, String correoPendiente) {

        DatosDeCuenta(Usuario usuario) {
            this(usuario.getNombre(), usuario.getCorreo(), usuario.getCorreoPendiente());
        }
    }

    record Mensaje(String mensaje) {
    }

    private final Usuarios usuarios;
    private final PasswordEncoder cifrado;
    private final Tokens tokens;
    private final Contrasenas contrasenas;
    private final Intentos intentos;
    private final Correos correos;
    private final String urlPublica;
    // Con un nombre que no existe se compara igual contra este hash, para que la respuesta tarde
    // lo mismo y no delate qué nombres tienen cuenta.
    private final String hashDeNadie;

    CuentaController(Usuarios usuarios, PasswordEncoder cifrado, Tokens tokens, Contrasenas contrasenas,
                     Intentos intentos, Correos correos, @Value("${regicide.url-publica}") String urlPublica) {
        this.usuarios = usuarios;
        this.cifrado = cifrado;
        this.tokens = tokens;
        this.contrasenas = contrasenas;
        this.intentos = intentos;
        this.correos = correos;
        this.urlPublica = urlPublica;
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
        String enlace = usuario.cambiarCorreo(sinBlancos(registro.correo()));
        usuarios.save(usuario);
        enviarConfirmacion(usuario, enlace);
        return ResponseEntity.status(HttpStatus.CREATED).body(new Token(tokens.emitir(usuario)));
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

    @GetMapping("/cuenta")
    DatosDeCuenta cuenta(@AuthenticationPrincipal Jwt jwt) {
        return new DatosDeCuenta(usuarios.findByNombre(jwt.getSubject()).orElseThrow());
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
            avisarDelCambioDeContrasena(usuario);
            return ResponseEntity.ok(new Token(tokens.emitir(usuario)));
        });
    }

    /** Pone otro correo, que no cuenta hasta que se confirma, o lo quita si llega vacío. */
    @PostMapping("/correo")
    ResponseEntity<?> cambiarCorreo(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CambioDeCorreo cambio,
                                    HttpServletRequest peticion) {
        return conContrasenaActual(jwt, cambio.contrasena(), peticion, usuario -> {
            String anterior = usuario.getCorreo();
            String enlace = usuario.cambiarCorreo(sinBlancos(cambio.correo()));
            usuarios.save(usuario);
            if (enlace == null && anterior != null) {
                correos.enviar(anterior, "Has quitado el correo de tu cuenta de Regicide", saludo(usuario)
                        + "Este correo ya no sirve para recuperar la contraseña de tu cuenta. Si no has sido tú, "
                        + "entra y cambia la contraseña cuanto antes.");
            }
            enviarConfirmacion(usuario, enlace);
            return ResponseEntity.ok(new DatosDeCuenta(usuario));
        });
    }

    @PostMapping("/correo/confirmar")
    ResponseEntity<?> confirmarCorreo(@RequestBody Enlace enlace) {
        Optional<Usuario> encontrado = conEnlace(enlace.enlace(), usuarios::findByEnlaceCorreo);
        if (encontrado.isEmpty()) {
            return enlaceNoValido();
        }
        Usuario usuario = encontrado.get();
        String anterior = usuario.getCorreo();
        if (!usuario.confirmarCorreo()) {
            return enlaceNoValido();
        }
        usuarios.save(usuario);
        // Si alguien con la contraseña cambia el correo, el dueño se entera en el de antes.
        if (anterior != null && !anterior.equalsIgnoreCase(usuario.getCorreo())) {
            correos.enviar(anterior, "El correo de tu cuenta de Regicide ha cambiado", saludo(usuario)
                    + "Este correo ya no sirve para recuperar la contraseña de tu cuenta. Si no has sido tú, "
                    + "entra y cambia la contraseña cuanto antes.");
        }
        return ResponseEntity.noContent().build();
    }

    /*
     * Siempre la misma respuesta, tenga la cuenta correo o no, y el correo sale en otro hilo para
     * que tampoco lo delate el tiempo. Más de 3 peticiones por nombre en 15 minutos no envían nada.
     */
    @PostMapping("/olvide")
    ResponseEntity<Mensaje> olvide(@RequestBody Olvido olvido, HttpServletRequest peticion) {
        String nombre = String.valueOf(olvido.nombre());
        if (intentos.pedirEnlace(nombre, peticion.getRemoteAddr())) {
            usuarios.findByNombre(nombre).filter(usuario -> usuario.getCorreo() != null).ifPresent(usuario -> {
                String enlace = usuario.nuevoEnlaceContrasena();
                usuarios.save(usuario);
                correos.enviar(usuario.getCorreo(), "Restablece tu contraseña de Regicide", saludo(usuario)
                        + "Para poner una contraseña nueva, abre este enlace en los próximos 30 minutos:\n\n"
                        + urlPublica + "/restablecer#" + enlace + "\n\n"
                        + "Si no lo has pedido tú, ignora este mensaje: tu contraseña no cambia.");
            });
        }
        return ResponseEntity.accepted().body(new Mensaje(
                "Si la cuenta tiene un correo confirmado, te hemos enviado un enlace. Caduca en 30 minutos."));
    }

    /** Pone la contraseña nueva con el enlace del correo. No inicia sesión: hay que entrar con ella. */
    @PostMapping("/restablecer")
    ResponseEntity<?> restablecer(@RequestBody Restablecimiento restablecimiento) {
        Optional<Usuario> encontrado = conEnlace(restablecimiento.enlace(), usuarios::findByEnlaceContrasena);
        if (encontrado.isEmpty()) {
            return enlaceNoValido();
        }
        Usuario usuario = encontrado.get();
        // La contraseña se comprueba antes de gastar el enlace, para poder corregirla.
        Optional<String> problema = contrasenas.problema(usuario.getNombre(), restablecimiento.nueva());
        if (problema.isPresent()) {
            return ResponseEntity.badRequest().body(new Mensaje(problema.get()));
        }
        boolean vigente = usuario.gastarEnlaceContrasena();
        if (vigente) {
            usuario.setContrasena(cifrado.encode(restablecimiento.nueva()));
            usuario.cerrarSesiones();
        }
        usuarios.save(usuario);
        if (!vigente) {
            return enlaceNoValido();
        }
        avisarDelCambioDeContrasena(usuario);
        return ResponseEntity.noContent().build();
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

    // Cambiar la contraseña o el correo y borrar la cuenta piden la contraseña actual: un token
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

    // Los enlaces tienen 256 bits: buscarlos por su resumen no necesita límite de intentos.
    private static Optional<Usuario> conEnlace(String enlace, Function<String, Optional<Usuario>> buscar) {
        return enlace == null || enlace.isBlank() ? Optional.empty() : buscar.apply(Usuario.resumen(enlace));
    }

    private void enviarConfirmacion(Usuario usuario, String enlace) {
        if (enlace == null) {
            return;
        }
        correos.enviar(usuario.getCorreoPendiente(), "Confirma tu correo en Regicide", saludo(usuario)
                + "Para usar este correo para recuperar la contraseña de tu cuenta, abre este enlace en las "
                + "próximas 24 horas:\n\n" + urlPublica + "/confirmar-correo#" + enlace + "\n\n"
                + "Solo lo usaremos para eso. Si no has creado tú la cuenta, ignora este mensaje.");
    }

    private void avisarDelCambioDeContrasena(Usuario usuario) {
        if (usuario.getCorreo() != null) {
            correos.enviar(usuario.getCorreo(), "Tu contraseña de Regicide ha cambiado", saludo(usuario)
                    + "La contraseña de tu cuenta acaba de cambiar y se han cerrado todas las sesiones. Si no has "
                    + "sido tú, recupérala desde " + urlPublica + "/entrar con \"¿Has olvidado la contraseña?\".");
        }
    }

    private static String saludo(Usuario usuario) {
        return "Hola, " + usuario.getNombre() + ":\n\n";
    }

    private static String sinBlancos(String correo) {
        return correo == null || correo.isBlank() ? null : correo.strip();
    }

    private static ResponseEntity<?> enlaceNoValido() {
        return ResponseEntity.badRequest().body(new Mensaje("El enlace no es válido o ha caducado. Pide otro."));
    }

    private static ResponseEntity<?> demasiados() {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new Mensaje("Demasiados intentos. Espera unos minutos y vuelve a probar."));
    }
}
