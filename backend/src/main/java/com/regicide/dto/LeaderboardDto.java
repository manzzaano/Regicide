package com.regicide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDto {
    private String username;
    private Long victorias;
    private Long total;
    private Double porcentaje;

    public LeaderboardDto(String username, Long victorias, Long total) {
        this.username = username;
        this.victorias = victorias;
        this.total = total;
        this.porcentaje = total > 0 ? (victorias.doubleValue() / total) * 100 : 0.0;
    }
}
