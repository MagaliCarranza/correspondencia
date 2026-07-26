package com.magali.correspondencia.dto;

import com.magali.correspondencia.model.EstadoCorrespondencia;
import java.time.LocalDate;

public record FiltrosCorrespondencia(
        String folio,
        String remitente,
        String asunto,
        Long areaDestinoId,
        EstadoCorrespondencia estado,
        LocalDate fechaDesde,
        LocalDate fechaHasta
) {}
