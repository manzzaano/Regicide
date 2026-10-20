package com.regicide.cuenta;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.authentication.password.CompromisedPasswordChecker;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.password.HaveIBeenPwnedRestApiPasswordChecker;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.client.RestClient;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.DispatcherType;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Configuration
class SeguridadConfig {

    private static final RequestMatcher PUBLICAS = new OrRequestMatcher(
            PathPatternRequestMatcher.withDefaults().matcher("/ws"),
            PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST, "/api/auth/register"),
            PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST, "/api/auth/login"),
            PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST, "/api/auth/recuperar"),
            PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/api/leaderboard"));

    private final SecretKey clave;

    SeguridadConfig(@Value("${regicide.jwt.secreto}") String secreto) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 bytes para firmar con HS256");
        }
        this.clave = new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    SecurityFilterChain seguridad(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(rutas -> rutas
                        // Sin esto, un 400 o un 500 llega al cliente como 401 al pasar por /error.
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(PUBLICAS).permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(servidor -> servidor
                        .bearerTokenResolver(tokenSoloEnRutasPrivadas())
                        .jwt(Customizer.withDefaults()))
                .build();
    }

    // En una ruta pública se ignora el token: uno caducado no debe impedir ver la clasificación.
    private static BearerTokenResolver tokenSoloEnRutasPrivadas() {
        DefaultBearerTokenResolver resolver = new DefaultBearerTokenResolver();
        return peticion -> PUBLICAS.matches(peticion) ? null : resolver.resolve(peticion);
    }

    // .cors() busca el bean por este nombre exacto; con otro, se ignora sin avisar.
    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${regicide.origenes-permitidos}") List<String> origenes) {
        CorsConfiguration configuracion = new CorsConfiguration();
        configuracion.setAllowedOrigins(origenes);
        configuracion.setAllowedMethods(List.of("GET", "POST"));
        configuracion.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/api/**", configuracion);
        return fuente;
    }

    @Bean
    JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(clave));
    }

    // Además de la firma y la caducidad, el token tiene que ser de un usuario que existe y de su
    // sesión actual: al cerrar sesión o cambiar la contraseña, los tokens anteriores dejan de valer.
    @Bean
    JwtDecoder jwtDecoder(Usuarios usuarios) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(clave).macAlgorithm(MacAlgorithm.HS256).build();
        OAuth2TokenValidator<Jwt> sesionVigente = jwt -> usuarios.findByNombre(jwt.getSubject())
                .filter(usuario -> jwt.getClaim(Tokens.SESION) instanceof Number version
                        && version.intValue() == usuario.getVersionSesion())
                .map(usuario -> OAuth2TokenValidatorResult.success())
                .orElseGet(() -> OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "Sesión cerrada", null)));
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), sesionVigente));
        return decoder;
    }

    // Argon2id con los parámetros mínimos de OWASP (19 MiB, 2 pasadas). Las contraseñas de antes
    // siguen en BCrypt sin prefijo y se pasan a Argon2 la próxima vez que su dueño entra.
    @Bean
    PasswordEncoder passwordEncoder() {
        BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();
        DelegatingPasswordEncoder cifrado = new DelegatingPasswordEncoder("argon2", Map.of(
                "argon2", new Argon2PasswordEncoder(16, 32, 1, 19456, 2),
                "bcrypt", bcrypt));
        cifrado.setDefaultPasswordEncoderForMatches(bcrypt);
        return cifrado;
    }

    // Si la API de Have I Been Pwned no responde en 3 segundos, la contraseña se da por buena: un
    // servicio externo caído no puede impedir registrarse. Solo viajan 5 caracteres del SHA-1.
    @Bean
    CompromisedPasswordChecker filtraciones() {
        SimpleClientHttpRequestFactory conexion = new SimpleClientHttpRequestFactory();
        conexion.setConnectTimeout(Duration.ofSeconds(3));
        conexion.setReadTimeout(Duration.ofSeconds(3));
        HaveIBeenPwnedRestApiPasswordChecker comprobador = new HaveIBeenPwnedRestApiPasswordChecker();
        comprobador.setRestClient(RestClient.builder()
                .baseUrl("https://api.pwnedpasswords.com/range/")
                .requestFactory(conexion)
                .build());
        return comprobador;
    }
}
