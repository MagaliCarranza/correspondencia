package com.magali.correspondencia.service;

import com.magali.correspondencia.dto.AreaResponse;
import com.magali.correspondencia.dto.CrearAreaRequest;
import com.magali.correspondencia.exception.ReglaNegocioException;
import com.magali.correspondencia.model.Area;
import com.magali.correspondencia.repository.AreaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AreaService {

    private final AreaRepository areaRepository;

    public AreaService(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    @Transactional(readOnly = true)
    public List<AreaResponse> listarActivas() {
        return areaRepository.findAllByActivoTrueOrderByNombreAsc().stream()
                .map(a -> new AreaResponse(a.getId(), a.getNombre(), a.isActivo()))
                .toList();
    }

    @Transactional
    public AreaResponse crear(CrearAreaRequest request) {
        areaRepository.findByNombreIgnoreCase(request.nombre()).ifPresent(a -> {
            throw new ReglaNegocioException("Ya existe un area con ese nombre");
        });
        Area nueva = Area.builder()
                .nombre(request.nombre().trim())
                .activo(true)
                .build();
        Area guardada = areaRepository.save(nueva);
        return new AreaResponse(guardada.getId(), guardada.getNombre(), guardada.isActivo());
    }
}
