package com.magali.correspondencia.dto;

import java.time.Instant;

public record CorrespondenciaResponse(
        Long id,
        String folio,
        Instant fechaRecepcion,
        String remitente,
        String tipoRemitente,
        String asunto,
        String tipo,
        String prioridad,
        Long areaDestinoId,
        String areaDestino,
        String observaciones,
        String estado,
        String recepcionadoPor,
        Long mensajeroId,
        String mensajero,
        Instant fechaAsignacion,
        Instant fechaEntrega,
        String nombreRecibe,
        String observacionesEntrega,
        String motivoAnulacion,
        Instant anuladoEn,
        String anuladoPor,
        String motivoArchivo,
        Instant archivadoEn,
        String archivadoPor,
        Instant creadoEn
) {}
