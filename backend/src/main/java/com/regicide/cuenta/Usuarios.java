package com.regicide.cuenta;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Usuarios extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    Optional<Usuario> findByEnlaceCorreo(String resumen);

    Optional<Usuario> findByEnlaceContrasena(String resumen);
}
