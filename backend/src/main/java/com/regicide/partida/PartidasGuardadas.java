package com.regicide.partida;

import org.springframework.data.jpa.repository.JpaRepository;

interface PartidasGuardadas extends JpaRepository<PartidaGuardada, Long> {
}
