package com.magali.correspondencia.config;

import com.magali.correspondencia.model.Area;
import com.magali.correspondencia.model.Rol;
import com.magali.correspondencia.model.Usuario;
import com.magali.correspondencia.repository.AreaRepository;
import com.magali.correspondencia.repository.UsuarioRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD_DEV = "admin1234";

    private final AreaRepository areaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AreaRepository areaRepository,
                      UsuarioRepository usuarioRepository,
                      PasswordEncoder passwordEncoder) {
        this.areaRepository = areaRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Area sistemas = sembrarArea("Sistemas");
        sembrarArea("Recursos Humanos");
        sembrarArea("Direccion");

        if (!usuarioRepository.existsByUsername(ADMIN_USERNAME)) {
            Usuario admin = Usuario.builder()
                    .nombreCompleto("Administrador del sistema")
                    .email("admin@correspondencia.local")
                    .username(ADMIN_USERNAME)
                    .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD_DEV))
                    .rol(Rol.ADMIN)
                    .area(sistemas)
                    .debeCambiarPassword(false)
                    .build();
            usuarioRepository.save(admin);
            log.info("Usuario admin creado - username='{}' password='{}' (solo dev)",
                    ADMIN_USERNAME, ADMIN_PASSWORD_DEV);
        }
    }

    private Area sembrarArea(String nombre) {
        return areaRepository.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> areaRepository.save(
                        Area.builder().nombre(nombre).activo(true).build()));
    }
}
