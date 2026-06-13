package com.regicide.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "partidas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Partida {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean ganada;

    @Column(nullable = false)
    private Integer turnosJugados;

    @Column(nullable = false)
    private Integer cartasJugadas;

    @Column(nullable = false)
    private Integer enemigoActual; // 1=Jack, 2=Queen, 3=King, 4=Won

    @Column(columnDefinition = "TEXT")
    private String detallesPartida; // JSON dump para análisis futuro
}
