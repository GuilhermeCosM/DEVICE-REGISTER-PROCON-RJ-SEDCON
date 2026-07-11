// Tipos e constantes usados pelo frontend.
// Substitui o antigo "@shared/schema" (que vinha do Drizzle/Node),
// já que agora o backend é uma API Java Spring Boot separada.

export const MACHINE_CATEGORIES = [
  "computador",
  "telefone",
  "switch",
  "impressora",
  "palo_alto",
] as const;

export type MachineCategory = (typeof MACHINE_CATEGORIES)[number];

export type Machine = {
  id: number;
  machineId: string;
  category: MachineCategory | string;
  macAddress?: string | null;
  serialNumber?: string | null;
  patrimonio?: string | null;
  collaborator?: string | null;
  broken?: boolean;
};
