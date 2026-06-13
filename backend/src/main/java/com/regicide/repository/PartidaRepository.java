package com.regicide.repository;

import com.regicide.entity.Partida;
import com.regicide.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartidaRepository extends JpaRepository<Partida, Long> {
    List<Partida> findByUserOrderByFechaDesc(User user);

    @Query(value = "SELECT u.username, COUNT(CASE WHEN p.ganada = true THEN 1 END) as victorias, " +
                   "COUNT(*) as total FROM partidas p JOIN users u ON p.user_id = u.id " +
                   "GROUP BY u.id, u.username ORDER BY victorias DESC LIMIT 100", nativeQuery = true)
    List<Object[]> findLeaderboard();
}
