package com.magali.correspondencia.repository;

import com.magali.correspondencia.model.Area;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AreaRepository extends JpaRepository<Area, Long> {
    Optional<Area> findByNombreIgnoreCase(String nombre);
    List<Area> findAllByActivoTrueOrderByNombreAsc();
}
