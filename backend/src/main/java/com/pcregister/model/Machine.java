package com.pcregister.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "machines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "machine_id", nullable = false, unique = true)
    private String machineId;

    @Column(nullable = false)
    private String category = "computador";

    @Column(name = "mac_address")
    private String macAddress;

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(name = "patrimonio")
    private String patrimonio;

    private String collaborator;

    @Column(nullable = false)
    private Boolean broken = false;
}
