package com.magali.correspondencia.repository;

import com.magali.correspondencia.model.Correspondencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CorrespondenciaRepository
        extends JpaRepository<Correspondencia, Long>, JpaSpecificationExecutor<Correspondencia> {
}
