package com.magali.correspondencia.dto;

import com.magali.correspondencia.model.Prioridad;
import com.magali.correspondencia.model.TipoCorrespondencia;
import com.magali.correspondencia.model.TipoRemitente;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearCorrespondenciaRequest(
        @NotBlank @Size(max = 120) String remitente,
        @NotNull TipoRemitente tipoRemitente,
        @NotBlank @Size(max = 200) String asunto,
        @NotNull TipoCorrespondencia tipo,
        @NotNull Prioridad prioridad,
        @NotNull Long areaDestinoId,
        @Size(max = 500) String observaciones
) {}
