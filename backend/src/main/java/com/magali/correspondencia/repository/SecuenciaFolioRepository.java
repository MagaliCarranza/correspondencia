package com.magali.correspondencia.repository;

import com.magali.correspondencia.model.SecuenciaFolio;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SecuenciaFolioRepository extends JpaRepository<SecuenciaFolio, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from SecuenciaFolio s where s.anio = :anio")
    Optional<SecuenciaFolio> buscarConBloqueo(@Param("anio") Integer anio);
}
