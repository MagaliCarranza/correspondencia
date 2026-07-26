package com.magali.correspondencia.service;

import com.magali.correspondencia.dto.LoginRequest;
import com.magali.correspondencia.dto.LoginResponse;
import com.magali.correspondencia.exception.CredencialesInvalidasException;
import com.magali.correspondencia.exception.CuentaBloqueadaException;
import com.magali.correspondencia.model.Usuario;
import com.magali.correspondencia.repository.UsuarioRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// Sin rollback en credenciales/bloqueo: queremos que persista el incremento
// de intentos fallidos y el flag "bloqueada" aunque se lance la excepcion.

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final int maxIntentos;
    private final long expiracionMinutos;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtEncoder jwtEncoder,
                       @Value("${correspondencia.seguridad.max-intentos-login}") int maxIntentos,
                       @Value("${correspondencia.seguridad.jwt-expiracion-minutos}") long expiracionMinutos) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.maxIntentos = maxIntentos;
        this.expiracionMinutos = expiracionMinutos;
    }

    @Transactional(noRollbackFor = {CredencialesInvalidasException.class, CuentaBloqueadaException.class})
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.username())
                .orElseThrow(() -> new CredencialesInvalidasException("Usuario o contraseña incorrectos"));

        if (usuario.isBloqueada()) {
            throw new CuentaBloqueadaException(
                    "La cuenta esta bloqueada. Contacta al administrador para desbloquearla.");
        }

        if (!passwordEncoder.matches(request.password(), usuario.getPasswordHash())) {
            usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);
            if (usuario.getIntentosFallidos() >= maxIntentos) {
                usuario.setBloqueada(true);
                usuarioRepository.save(usuario);
                log.warn("Cuenta bloqueada por {} intentos fallidos: {}", maxIntentos, usuario.getUsername());
                throw new CuentaBloqueadaException(
                        "Se supero el numero maximo de intentos. La cuenta fue bloqueada.");
            }
            usuarioRepository.save(usuario);
            throw new CredencialesInvalidasException("Usuario o contraseña incorrectos");
        }

        usuario.setIntentosFallidos(0);
        usuarioRepository.save(usuario);

        String token = emitirToken(usuario);
        return new LoginResponse(
                token,
                usuario.getUsername(),
                usuario.getNombreCompleto(),
                usuario.getRol().name(),
                usuario.getArea().getNombre(),
                usuario.isDebeCambiarPassword());
    }

    private String emitirToken(Usuario usuario) {
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("correspondencia")
                .issuedAt(ahora)
                .expiresAt(ahora.plus(expiracionMinutos, ChronoUnit.MINUTES))
                .subject(usuario.getUsername())
                .claim("rol", usuario.getRol().name())
                .claim("nombre", usuario.getNombreCompleto())
                .build();
        JwsHeader header = JwsHeader.with(() -> "HS256").build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
