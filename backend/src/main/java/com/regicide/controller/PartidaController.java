package com.regicide.controller;

import com.regicide.dto.LeaderboardDto;
import com.regicide.dto.PartidaRequest;
import com.regicide.entity.Partida;
import com.regicide.service.PartidaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@CrossOrigin(origins = "http://localhost:4200")
public class PartidaController {
    @Autowired
    private PartidaService partidaService;

    @PostMapping("/partidas")
    public ResponseEntity<Partida> savePartida(@RequestBody PartidaRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Partida partida = partidaService.savePartida(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(partida);
    }

    @GetMapping("/partidas/me")
    public ResponseEntity<List<Partida>> getMyPartidas() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        List<Partida> partidas = partidaService.getPartidasByUser(username);
        return ResponseEntity.ok(partidas);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardDto>> getLeaderboard() {
        List<LeaderboardDto> leaderboard = partidaService.getLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }
}
