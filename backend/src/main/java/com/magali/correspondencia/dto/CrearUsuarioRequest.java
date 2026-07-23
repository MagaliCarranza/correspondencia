package com.magali.correspondencia.dto;

import com.magali.correspondencia.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CrearUsuarioRequest(
        @NotBlank @Size(max = 50) String nombreCompleto,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 6, max = 12) @Pattern(regexp = "^[A-Za-z0-9._-]+$",
                message = "El nombre de usuario no puede contener espacios ni caracteres especiales")
        String username,
        @NotNull Long areaId,
        @NotNull Rol rol
) {}
