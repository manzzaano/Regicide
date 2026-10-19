package com.regicide.cuenta;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class ErroresDeValidacion {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<CuentaController.Mensaje> datosNoValidos(MethodArgumentNotValidException error) {
        String mensaje = error.getBindingResult().getFieldErrors().getFirst().getDefaultMessage();
        return ResponseEntity.badRequest().body(new CuentaController.Mensaje(mensaje));
    }
}
