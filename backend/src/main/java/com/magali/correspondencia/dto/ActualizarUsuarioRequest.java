package com.magali.correspondencia.dto;

import com.magali.correspondencia.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ActualizarUsuarioRequest(
        @NotBlank @Size(max = 50) String nombreCompleto,
        @NotBlank @Email @Size(max = 120) String email,
        @NotNull Long areaId,
        @NotNull Rol rol
) {}
