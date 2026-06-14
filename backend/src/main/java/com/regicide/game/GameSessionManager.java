package com.regicide.game;

import com.regicide.dto.GameState;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GameSessionManager {
    private final Map<String, RegicideGame> activeSessions = new ConcurrentHashMap<>();

    public String startGame(String username) {
        String gameId = UUID.randomUUID().toString();
        RegicideGame game = new RegicideGame(gameId, username);
        activeSessions.put(gameId, game);
        return gameId;
    }

    public RegicideGame getGame(String gameId) {
        return activeSessions.get(gameId);
    }

    public GameState getGameState(String gameId) {
        RegicideGame game = activeSessions.get(gameId);
        if (game == null) {
            return GameState.builder()
                    .error("Juego no encontrado")
                    .build();
        }
        return game.getState();
    }

    public GameState playCard(String gameId, int cardIndex) {
        RegicideGame game = activeSessions.get(gameId);
        if (game == null) {
            return GameState.builder()
                    .error("Juego no encontrado")
                    .build();
        }
        return game.playCard(cardIndex);
    }

    public GameState attack(String gameId, List<Integer> cardIndices) {
        RegicideGame game = activeSessions.get(gameId);
        if (game == null) {
            return GameState.builder()
                    .error("Juego no encontrado")
                    .build();
        }
        return game.attack(cardIndices);
    }

    public GameState useJoker(String gameId) {
        RegicideGame game = activeSessions.get(gameId);
        if (game == null) {
            return GameState.builder()
                    .error("Juego no encontrado")
                    .build();
        }
        return game.useJoker();
    }

    public GameState finishGame(String gameId) {
        RegicideGame game = activeSessions.remove(gameId);
        if (game == null) {
            return GameState.builder()
                    .error("Juego no encontrado")
                    .build();
        }
        return game.getState();
    }
}
