package com.magali.correspondencia.service;

import com.magali.correspondencia.dto.CrearUsuarioRequest;
import com.magali.correspondencia.dto.UsuarioResponse;
import com.magali.correspondencia.exception.RecursoNoEncontradoException;
import com.magali.correspondencia.exception.ReglaNegocioException;
import com.magali.correspondencia.model.Area;
import com.magali.correspondencia.model.Usuario;
import com.magali.correspondencia.repository.AreaRepository;
import com.magali.correspondencia.repository.UsuarioRepository;
import java.security.SecureRandom;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);
    private static final String ALFABETO_TEMP = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    private static final int LONGITUD_PASSWORD_TEMP = 10;

    private final UsuarioRepository usuarioRepository;
    private final AreaRepository areaRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public UsuarioService(UsuarioRepository usuarioRepository,
                          AreaRepository areaRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.areaRepository = areaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponse crear(CrearUsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.username())) {
            throw new ReglaNegocioException("El nombre de usuario ya esta en uso");
        }
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ReglaNegocioException("El correo electronico ya esta registrado");
        }
        Area area = areaRepository.findById(request.areaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Area no encontrada"));

        String passwordTemporal = generarPasswordTemporal();
        Usuario usuario = Usuario.builder()
                .nombreCompleto(request.nombreCompleto())
                .email(request.email())
                .username(request.username())
                .passwordHash(passwordEncoder.encode(passwordTemporal))
                .rol(request.rol())
                .area(area)
                .debeCambiarPassword(true)
                .build();

        Usuario guardado = usuarioRepository.save(usuario);

        // TODO: reemplazar por envio real de correo cuando este SMTP configurado.
        log.info("Credenciales temporales para {}: usuario='{}', password='{}'",
                guardado.getEmail(), guardado.getUsername(), passwordTemporal);

        return mapearRespuesta(guardado);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream()
                .map(this::mapearRespuesta)
                .toList();
    }

    @Transactional
    public UsuarioResponse desbloquear(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        usuario.setBloqueada(false);
        usuario.setIntentosFallidos(0);
        return mapearRespuesta(usuarioRepository.save(usuario));
    }

    private String generarPasswordTemporal() {
        StringBuilder sb = new StringBuilder(LONGITUD_PASSWORD_TEMP);
        for (int i = 0; i < LONGITUD_PASSWORD_TEMP; i++) {
            sb.append(ALFABETO_TEMP.charAt(random.nextInt(ALFABETO_TEMP.length())));
        }
        return sb.toString();
    }

    private UsuarioResponse mapearRespuesta(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getNombreCompleto(),
                u.getEmail(),
                u.getUsername(),
                u.getRol().name(),
                u.getArea().getNombre(),
                u.getArea().getId(),
                u.isBloqueada(),
                u.isDebeCambiarPassword());
    }
}
