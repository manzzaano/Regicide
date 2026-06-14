package com.regicide.game;

import com.regicide.dto.GameState;
import com.regicide.model.Baraja;
import com.regicide.model.Carta;
import com.regicide.model.Juego;
import lombok.Getter;

import java.util.*;
import java.util.stream.Collectors;

@Getter
public class RegicideGame {
    private final String gameId;
    private final String username;
    private final Juego game;
    private String phase; // ATTACK, DEFENSE, GAME_OVER
    private int turnCount;
    private int cardsPlayed;
    private boolean gameWon;
    private int jokersUsed;
    private int currentEnemyDamage;
    private List<Integer> selectedCardIndices;

    public RegicideGame(String gameId, String username) {
        this.gameId = gameId;
        this.username = username;
        this.game = new Juego(new Baraja());
        this.phase = "ATTACK";
        this.turnCount = 1;
        this.cardsPlayed = 0;
        this.gameWon = false;
        this.jokersUsed = 0;
        this.selectedCardIndices = new ArrayList<>();
        setCurrentEnemyDamage();
    }

    private void setCurrentEnemyDamage() {
        if (!game.getCastillo().isEmpty()) {
            currentEnemyDamage = game.getCastillo().get(0).getDano();
        }
    }

    public GameState playCard(int cardIndex) {
        try {
            if (phase.equals("DEFENSE")) {
                return defendWithCard(cardIndex);
            }
            return buildState(null);
        } catch (Exception e) {
            return buildState("Error: " + e.getMessage());
        }
    }

    public GameState attack(List<Integer> cardIndices) {
        try {
            if (cardIndices.isEmpty() || cardIndices.size() > 4) {
                return buildState("Selecciona entre 1 y 4 cartas");
            }

            List<Carta> selectedCards = cardIndices.stream()
                    .map(idx -> game.getMano().get(idx))
                    .collect(Collectors.toList());

            if (!isValidCombination(selectedCards)) {
                return buildState("Combinación de cartas inválida");
            }

            int damage = calculateDamage(selectedCards);
            activatePowers(selectedCards, damage);

            Carta enemy = game.getCastillo().get(0);
            enemy.setNumero(enemy.getNumero() - damage);

            selectedCards.forEach(game.getMano()::remove);
            cardsPlayed += selectedCards.size();

            if (enemy.getNumero() <= 0) {
                game.getCastillo().remove(0);
                if (game.getCastillo().isEmpty()) {
                    gameWon = true;
                    phase = "GAME_OVER";
                    return buildState("¡Ganaste!");
                }
                turnCount++;
                setCurrentEnemyDamage();
                phase = "ATTACK";
            } else {
                phase = "DEFENSE";
            }

            return buildState(null);
        } catch (Exception e) {
            return buildState("Error: " + e.getMessage());
        }
    }

    private boolean isValidCombination(List<Carta> cards) {
        if (cards.isEmpty()) return false;

        Set<String> suits = cards.stream().map(Carta::getPalo).collect(Collectors.toSet());
        Set<Integer> values = cards.stream().map(Carta::getNumero).collect(Collectors.toSet());

        boolean hasJoker = cards.stream().anyMatch(c -> c.getNumero() == 1);

        if (cards.size() == 1) return true;

        if (hasJoker) {
            return cards.size() == 2;
        }

        return values.size() == 1 && suits.size() == cards.size();
    }

    private int calculateDamage(List<Carta> cards) {
        int damage = cards.stream()
                .mapToInt(c -> c.getNumero() == 1 ? 1 : c.getNumero())
                .sum();

        boolean hasClubs = cards.stream().anyMatch(c -> "Tréboles".equals(c.getPalo()));
        if (hasClubs) damage *= 2;

        return damage;
    }

    private void activatePowers(List<Carta> cards, int damage) {
        boolean hasHearts = cards.stream().anyMatch(c -> "Corazones".equals(c.getPalo()));
        boolean hasDiamonds = cards.stream().anyMatch(c -> "Diamantes".equals(c.getPalo()));
        boolean hasSpades = cards.stream().anyMatch(c -> "Picas".equals(c.getPalo()));

        Carta enemy = game.getCastillo().get(0);

        if (hasHearts && !"Corazones".equals(enemy.getPalo())) {
            damage = (int)(damage * 0.8);
        }

        if (hasDiamonds && !"Diamantes".equals(enemy.getPalo())) {
            int cardsToRob = Math.min(8 - game.getMano().size(), (damage / 10) + 1);
            for (int i = 0; i < cardsToRob && !game.getMazoPosada().isEmpty(); i++) {
                game.getMano().add(game.getMazoPosada().remove(0));
            }
        }

        if (hasSpades && !"Picas".equals(enemy.getPalo())) {
            currentEnemyDamage = Math.max(0, currentEnemyDamage - (damage / 5));
        }
    }

    private GameState defendWithCard(int cardIndex) {
        if (cardIndex < 0 || cardIndex >= game.getMano().size()) {
            return buildState("Índice inválido");
        }

        Carta defendCard = game.getMano().remove(cardIndex);
        currentEnemyDamage = Math.max(0, currentEnemyDamage - defendCard.getNumero());

        if (currentEnemyDamage <= 0) {
            phase = "ATTACK";
            turnCount++;
            if (!game.getCastillo().isEmpty()) {
                setCurrentEnemyDamage();
            }
        }

        return buildState(null);
    }

    public GameState useJoker() {
        if (jokersUsed >= 2) {
            return buildState("Ya usaste los 2 comodines");
        }

        jokersUsed++;
        game.getMano().clear();

        Random rand = new Random();
        while (game.getMano().size() < 8 && !game.getMazoPosada().isEmpty()) {
            int idx = rand.nextInt(game.getMazoPosada().size());
            Carta card = game.getMazoPosada().get(idx);
            if (card.getNumero() <= 10) {
                game.getMano().add(card);
                game.getMazoPosada().remove(idx);
            }
        }

        return buildState(null);
    }

    public GameState getState() {
        return buildState(null);
    }

    private GameState buildState(String error) {
        List<Integer> hand = game.getMano().stream()
                .map(Carta::getNumero)
                .collect(Collectors.toList());

        String currentEnemy = game.getCastillo().isEmpty() ? "NINGUNO"
                : "Rango " + getCurrentEnemyRank();

        int enemyHP = game.getCastillo().isEmpty() ? 0
                : game.getCastillo().get(0).getNumero();

        return GameState.builder()
                .gameId(gameId)
                .phase(phase)
                .hand(hand)
                .enemyHP(enemyHP)
                .currentEnemy(currentEnemy)
                .currentDamage(currentEnemyDamage)
                .turnCount(turnCount)
                .cardsPlayed(cardsPlayed)
                .gameWon(gameWon)
                .message(phase.equals("GAME_OVER") ? (gameWon ? "¡Ganaste!" : "Perdiste") : null)
                .error(error)
                .build();
    }

    private String getCurrentEnemyRank() {
        if (game.getCastillo().isEmpty()) return "NINGUNO";
        int hp = game.getCastillo().get(0).getNumero();
        if (hp <= 10) return "J (Jack/10)";
        if (hp <= 15) return "Q (Queen/15)";
        return "K (King/20)";
    }
}
