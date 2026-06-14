package com.regicide.game;

import com.regicide.dto.GameState;
import com.regicide.model.Baraja;
import com.regicide.model.Juego;
import lombok.Getter;

@Getter
public class RegicideGame {
    private final String gameId;
    private final String username;
    private final Juego gameState;
    private String phase; // ATTACK, DEFENSE, GAME_OVER
    private int turnCount;
    private int cardsPlayed;
    private boolean gameWon;

    public RegicideGame(String gameId, String username) {
        this.gameId = gameId;
        this.username = username;
        this.gameState = new Juego(new Baraja());
        this.phase = "ATTACK";
        this.turnCount = 1;
        this.cardsPlayed = 0;
        this.gameWon = false;
    }

    public GameState playCard(int cardIndex) {
        try {
            if (cardIndex < 0 || cardIndex >= gameState.getMano().size()) {
                return buildState("Índice de carta inválido");
            }

            // TODO: Implementar lógica completa de juego
            // Por ahora, stub para testing

            cardsPlayed++;
            return buildState(null);
        } catch (Exception e) {
            return buildState("Error: " + e.getMessage());
        }
    }

    public GameState getState() {
        return buildState(null);
    }

    private GameState buildState(String error) {
        return GameState.builder()
                .gameId(gameId)
                .phase(phase)
                .hand(gameState.getMano().stream().map(c -> c.getNumero()).toList())
                .enemyHP(gameState.getCastillo().isEmpty() ? 0 : gameState.getCastillo().get(0).getVida())
                .currentEnemy(gameState.getCastillo().isEmpty() ? "NINGUNO" : "ENEMIGO")
                .turnCount(turnCount)
                .cardsPlayed(cardsPlayed)
                .gameWon(gameWon)
                .error(error)
                .build();
    }
}
