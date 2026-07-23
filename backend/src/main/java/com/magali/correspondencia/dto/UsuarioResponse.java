package com.magali.correspondencia.dto;

public record UsuarioResponse(
        Long id,
        String nombreCompleto,
        String email,
        String username,
        String rol,
        String area,
        Long areaId,
        boolean bloqueada,
        boolean debeCambiarPassword
) {}
