package com.pcregister.controller;

import com.pcregister.model.Machine;
import com.pcregister.service.MachineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/machines")
@CrossOrigin(origins = "*")
public class MachineController {

    private final MachineService service;

    public MachineController(MachineService service) {
        this.service = service;
    }

    @GetMapping
    public List<Machine> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Machine> getOne(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Machine machine) {
        if (machine.getMachineId() == null || machine.getMachineId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "machineId is required"));
        }

        Optional<Machine> existing = service.findByMachineId(machine.getMachineId());
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Machine ID already exists"));
        }

        Machine saved = service.create(machine);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Machine> update(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return service.update(id, updates)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!service.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assign(@RequestBody Map<String, String> body) {
        String collaborator = body.get("collaborator");
        if (collaborator == null || collaborator.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Collaborator name is required"));
        }

        return service.assignCollaboratorToUnassigned(collaborator)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No unassigned machines available")));
    }
}
