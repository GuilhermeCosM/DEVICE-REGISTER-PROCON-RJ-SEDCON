package com.pcregister.service;

import com.pcregister.model.Machine;
import com.pcregister.repository.MachineRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MachineService {

    private final MachineRepository repository;

    public MachineService(MachineRepository repository) {
        this.repository = repository;
    }

    public List<Machine> findAll() {
        return repository.findAllByOrderByMachineIdAsc();
    }

    public Optional<Machine> findById(Long id) {
        return repository.findById(id);
    }

    public Optional<Machine> findByMachineId(String machineId) {
        return repository.findByMachineId(machineId);
    }

    public Machine create(Machine machine) {
        if (machine.getCategory() == null || machine.getCategory().isBlank()) {
            machine.setCategory("computador");
        }
        if (machine.getBroken() == null) {
            machine.setBroken(false);
        }
        return repository.save(machine);
    }

    public Optional<Machine> update(Long id, Map<String, Object> updates) {
        return repository.findById(id).map(machine -> {
            if (updates.containsKey("machineId")) {
                Object v = updates.get("machineId");
                machine.setMachineId(v != null ? v.toString() : null);
            }
            if (updates.containsKey("category")) {
                Object v = updates.get("category");
                machine.setCategory(v != null ? v.toString() : "computador");
            }
            if (updates.containsKey("macAddress")) {
                Object v = updates.get("macAddress");
                machine.setMacAddress(v != null ? v.toString() : null);
            }
            if (updates.containsKey("serialNumber")) {
                Object v = updates.get("serialNumber");
                machine.setSerialNumber(v != null ? v.toString() : null);
            }
            if (updates.containsKey("patrimonio")) {
                Object v = updates.get("patrimonio");
                machine.setPatrimonio(v != null ? v.toString() : null);
            }
            if (updates.containsKey("collaborator")) {
                Object v = updates.get("collaborator");
                machine.setCollaborator(v != null ? v.toString() : null);
            }
            if (updates.containsKey("broken")) {
                Object v = updates.get("broken");
                machine.setBroken(v != null ? (Boolean) v : false);
            }
            return repository.save(machine);
        });
    }

    public boolean delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Machine> assignCollaboratorToUnassigned(String collaborator) {
        List<Machine> candidates = repository.findUnassigned(PageRequest.of(0, 1));
        if (candidates.isEmpty()) {
            return Optional.empty();
        }
        Machine machine = candidates.get(0);
        machine.setCollaborator(collaborator);
        return Optional.of(repository.save(machine));
    }
}
