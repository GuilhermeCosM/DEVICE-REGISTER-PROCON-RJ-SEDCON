package com.pcregister.repository;

import com.pcregister.model.Machine;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MachineRepository extends JpaRepository<Machine, Long> {

    List<Machine> findAllByOrderByMachineIdAsc();

    Optional<Machine> findByMachineId(String machineId);

    @Query("SELECT m FROM Machine m WHERE m.collaborator IS NULL OR m.collaborator = '' ORDER BY m.id ASC")
    List<Machine> findUnassigned(Pageable pageable);
}
