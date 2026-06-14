package com.regicide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameMessage {
    private String type; // START_GAME, PLAY_CARD, DEFEND, GAME_STATE, GAME_OVER
    private String gameId;
    private Integer cardIndex;
    private Object payload;
}
