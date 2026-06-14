package com.regicide.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameState {
    private String gameId;
    private String phase; // ATTACK, DEFENSE, GAME_OVER
    private List<Integer> hand; // índices de cartas en mano
    private Integer enemyHP;
    private String currentEnemy; // J, Q, K
    private Integer currentDamage; // daño del enemigo
    private Integer turnCount;
    private Integer cardsPlayed;
    private String message;
    private Boolean gameWon;
    private String error;
}
