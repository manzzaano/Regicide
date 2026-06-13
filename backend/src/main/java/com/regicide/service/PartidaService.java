package com.regicide.service;

import com.regicide.dto.LeaderboardDto;
import com.regicide.dto.PartidaRequest;
import com.regicide.entity.Partida;
import com.regicide.entity.User;
import com.regicide.repository.PartidaRepository;
import com.regicide.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PartidaService {
    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private UserRepository userRepository;

    public Partida savePartida(String username, PartidaRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Partida partida = Partida.builder()
                .user(user)
                .ganada(request.getGanada())
                .turnosJugados(request.getTurnosJugados())
                .cartasJugadas(request.getCartasJugadas())
                .enemigoActual(request.getEnemigoActual())
                .detallesPartida(request.getDetallesPartida())
                .build();

        return partidaRepository.save(partida);
    }

    public List<Partida> getPartidasByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return partidaRepository.findByUserOrderByFechaDesc(user);
    }

    public List<LeaderboardDto> getLeaderboard() {
        List<Object[]> results = partidaRepository.findLeaderboard();
        List<LeaderboardDto> leaderboard = new ArrayList<>();

        for (Object[] row : results) {
            String username = (String) row[0];
            Long victorias = ((Number) row[1]).longValue();
            Long total = ((Number) row[2]).longValue();
            leaderboard.add(new LeaderboardDto(username, victorias, total));
        }

        return leaderboard;
    }
}
