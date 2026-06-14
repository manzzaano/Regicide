package com.regicide.controller;

import com.regicide.dto.GameMessage;
import com.regicide.dto.GameState;
import com.regicide.game.GameSessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class GameWebSocketController {

    @Autowired
    private GameSessionManager sessionManager;

    @MessageMapping("/game/start")
    @SendTo("/topic/game")
    public GameState startGame(GameMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String gameId = sessionManager.startGame(username != null ? username : "player");
        headerAccessor.getSessionAttributes().put("gameId", gameId);
        return sessionManager.getGameState(gameId);
    }

    @MessageMapping("/game/play")
    @SendTo("/topic/game")
    public GameState playCard(GameMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String gameId = (String) headerAccessor.getSessionAttributes().get("gameId");
        if (gameId == null) {
            return GameState.builder().error("No hay juego activo").build();
        }

        if ("ATTACK".equals(message.getType())) {
            return sessionManager.attack(gameId, (java.util.List<Integer>) message.getPayload());
        } else if ("DEFEND".equals(message.getType())) {
            return sessionManager.playCard(gameId, message.getCardIndex() != null ? message.getCardIndex() : 0);
        } else if ("JOKER".equals(message.getType())) {
            return sessionManager.useJoker(gameId);
        }

        return GameState.builder().error("Mensaje inválido").build();
    }

    @MessageMapping("/game/state")
    @SendTo("/topic/game")
    public GameState getGameState(SimpMessageHeaderAccessor headerAccessor) {
        String gameId = (String) headerAccessor.getSessionAttributes().get("gameId");
        if (gameId == null) {
            return GameState.builder().error("No hay juego activo").build();
        }
        return sessionManager.getGameState(gameId);
    }

    @MessageMapping("/game/finish")
    @SendTo("/topic/game")
    public GameState finishGame(SimpMessageHeaderAccessor headerAccessor) {
        String gameId = (String) headerAccessor.getSessionAttributes().get("gameId");
        if (gameId == null) {
            return GameState.builder().error("No hay juego activo").build();
        }
        GameState state = sessionManager.finishGame(gameId);
        headerAccessor.getSessionAttributes().remove("gameId");
        return state;
    }
}
