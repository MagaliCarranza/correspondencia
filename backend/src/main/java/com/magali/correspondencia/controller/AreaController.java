package com.magali.correspondencia.controller;

import com.magali.correspondencia.dto.AreaResponse;
import com.magali.correspondencia.dto.CrearAreaRequest;
import com.magali.correspondencia.service.AreaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/areas")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @GetMapping
    public List<AreaResponse> listar() {
        return areaService.listarActivas();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public AreaResponse crear(@Valid @RequestBody CrearAreaRequest request) {
        return areaService.crear(request);
    }
}
