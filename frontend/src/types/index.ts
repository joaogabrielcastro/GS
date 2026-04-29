export type UserRole = "MOTORISTA" | "ADMINISTRADOR" | "FINANCEIRO";

export type VehicleType =
  | "TOCO"
  | "TRUCK"
  | "BITRUCK"
  | "CAVALO_MECANICO"
  | "CARRETA_SIMPLES"
  | "CARRETA_LS"
  | "BITREM"
  | "RODOTREM";

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  TOCO: "Toco (2 eixos / 6 pneus)",
  TRUCK: "Truck (3 eixos / 10 pneus)",
  BITRUCK: "Bitruck (4 eixos / 14 pneus)",
  CAVALO_MECANICO: "Cavalo Mecânico (3 eixos / 10 pneus)",
  CARRETA_SIMPLES: "Carreta Simples (5 eixos / 18 pneus)",
  CARRETA_LS: "Carreta LS (6 eixos / 22 pneus)",
  BITREM: "Bitrem (7 eixos / 26 pneus)",
  RODOTREM: "Rodotrem (9 eixos / 34 pneus)",
};

export interface AxleConfig {
  axleNumber: number;
  label: string;
  /** single = 1 pneu por lado (eixo dianteiro), double = 2 pneus por lado (eixo traseiro duplo) */
  tiresPerSide: "single" | "double";
  section?: string; // 'Cavalo' | '1° Semirreboque' | ...
}

export const VEHICLE_AXLES: Record<VehicleType, AxleConfig[]> = {
  TOCO: [
    { axleNumber: 1, label: "Eixo Dianteiro", tiresPerSide: "single" },
    { axleNumber: 2, label: "Eixo Traseiro", tiresPerSide: "double" },
  ],
  TRUCK: [
    { axleNumber: 1, label: "Eixo Dianteiro", tiresPerSide: "single" },
    { axleNumber: 2, label: "Eixo Traseiro 1", tiresPerSide: "double" },
    { axleNumber: 3, label: "Eixo Traseiro 2", tiresPerSide: "double" },
  ],
  BITRUCK: [
    { axleNumber: 1, label: "Eixo Dianteiro 1", tiresPerSide: "single" },
    { axleNumber: 2, label: "Eixo Dianteiro 2", tiresPerSide: "single" },
    { axleNumber: 3, label: "Eixo Traseiro 1", tiresPerSide: "double" },
    { axleNumber: 4, label: "Eixo Traseiro 2", tiresPerSide: "double" },
  ],
  CAVALO_MECANICO: [
    { axleNumber: 1, label: "Eixo Dianteiro", tiresPerSide: "single" },
    { axleNumber: 2, label: "Eixo Traseiro 1", tiresPerSide: "double" },
    { axleNumber: 3, label: "Eixo Traseiro 2", tiresPerSide: "double" },
  ],
  CARRETA_SIMPLES: [
    {
      axleNumber: 1,
      label: "Eixo Dianteiro",
      tiresPerSide: "single",
      section: "Cavalo",
    },
    {
      axleNumber: 2,
      label: "Eixo Traseiro 1",
      tiresPerSide: "double",
      section: "Cavalo",
    },
    {
      axleNumber: 3,
      label: "Eixo Traseiro 2",
      tiresPerSide: "double",
      section: "Cavalo",
    },
    {
      axleNumber: 4,
      label: "Eixo Carreta 1",
      tiresPerSide: "double",
      section: "Semirreboque",
    },
    {
      axleNumber: 5,
      label: "Eixo Carreta 2",
      tiresPerSide: "double",
      section: "Semirreboque",
    },
  ],
  CARRETA_LS: [
    {
      axleNumber: 1,
      label: "Eixo Dianteiro",
      tiresPerSide: "single",
      section: "Cavalo",
    },
    {
      axleNumber: 2,
      label: "Eixo Traseiro 1",
      tiresPerSide: "double",
      section: "Cavalo",
    },
    {
      axleNumber: 3,
      label: "Eixo Traseiro 2",
      tiresPerSide: "double",
      section: "Cavalo",
    },
    {
      axleNumber: 4,
      label: "Eixo Carreta 1",
      tiresPerSide: "double",
      section: "Semirreboque",
    },
    {
      axleNumber: 5,
      label: "Eixo Carreta 2",
      tiresPerSide: "double",
      section: "Semirreboque",
    },
    {
      axleNumber: 6,
      label: "Eixo Carreta 3",
      tiresPerSide: "double",
      section: "Semirreboque",
    },
  ],
  BITREM: [
    {
      axleNumber: 1,
      label: "Eixo Dianteiro",
      tiresPerSide: "single",
      section: "Cavalo",
    },
    {
      axleNumber: 2,
      label: "Eixo Traseiro 1",
      tiresPerSide: "double",
      section: "Cavalo",
    },
    {
      axleNumber: 3,
      label: "Eixo Traseiro 2",
      tiresPerSide: "double",
      section: "Cavalo",
    },
    {
      axleNumber: 4,
      label: "Eixo 1° Semi 1",
      tiresPerSide: "double",
      section: "1° Semirreboque",
    },
    {
      axleNumber: 5,
      label: "Eixo 2° Semi 1",
      tiresPerSide: "double",
      section: "2° Semirreboque",
    },
    {
      axleNumber: 6,
      label: "Eixo 2° Semi 2",
      tiresPerSide: "double",
      section: "2° Semirreboque",
    },
    {
      axleNumber: 7,
      label: "Eixo 2° Semi 3",
      tiresPerSide: "double",
      section: "2° Semirreboque",
    },
  ],
  RODOTREM: [
    {
      axleNumber: 1,
      label: "Eixo Dianteiro",
      tiresPerSide: "single",
      section: "Cavalo",
    },
    {
      axleNumber: 2,
      label: "Eixo Traseiro 1",
      tiresPerSide: "double",
      section: "Cavalo",
    },
    {
      axleNumber: 3,
      label: "Eixo Traseiro 2",
      tiresPerSide: "double",
      section: "Cavalo",
    },
    {
      axleNumber: 4,
      label: "Eixo 1° Semi 1",
      tiresPerSide: "double",
      section: "1° Semirreboque",
    },
    {
      axleNumber: 5,
      label: "Eixo 1° Semi 2",
      tiresPerSide: "double",
      section: "1° Semirreboque",
    },
    {
      axleNumber: 6,
      label: "Eixo 1° Semi 3",
      tiresPerSide: "double",
      section: "1° Semirreboque",
    },
    {
      axleNumber: 7,
      label: "Eixo 2° Semi 1",
      tiresPerSide: "double",
      section: "2° Semirreboque",
    },
    {
      axleNumber: 8,
      label: "Eixo 2° Semi 2",
      tiresPerSide: "double",
      section: "2° Semirreboque",
    },
    {
      axleNumber: 9,
      label: "Eixo 2° Semi 3",
      tiresPerSide: "double",
      section: "2° Semirreboque",
    },
  ],
};

/** Retorna a lista de posições de pneu para o tipo de veículo (ex: E1E, E2EE, E2DI, ESTEPE1) */
export function getTirePositions(vehicleType: VehicleType): string[] {
  const axles = VEHICLE_AXLES[vehicleType];
  const positions: string[] = [];
  for (const axle of axles) {
    const n = axle.axleNumber;
    if (axle.tiresPerSide === "single") {
      positions.push(`E${n}E`); // esquerdo
      positions.push(`E${n}D`); // direito
    } else {
      positions.push(`E${n}EE`); // esquerdo externo
      positions.push(`E${n}EI`); // esquerdo interno
      positions.push(`E${n}DE`); // direito externo
      positions.push(`E${n}DI`); // direito interno
    }
  }
  positions.push("ESTEPE1");
  positions.push("ESTEPE2");
  return positions;
}

export function getTirePositionLabel(pos: string): string {
  const map: Record<string, string> = {
    E1E: "Dianteiro Esq",
    E1D: "Dianteiro Dir",
    ESTEPE1: "Estepe 1",
    ESTEPE2: "Estepe 2",
  };
  if (map[pos]) return map[pos];
  // E2EE → "Eixo 2 Esq Ext"  E3DI → "Eixo 3 Dir Int"
  const m = pos.match(/^E(\d+)(E|D)(E|I)$/);
  if (m) {
    const [, n, lado, tipo] = m;
    return `Eixo ${n} ${lado === "E" ? "Esq" : "Dir"} ${tipo === "E" ? "Ext" : "Int"}`;
  }
  return pos;
}

export interface User {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Truck {
  id: string;
  plate: string;
  trailerPlates?: string[];
  model: string;
  brand: string;
  year: number;
  vehicleType: VehicleType;
  status: "ATIVO" | "MANUTENCAO" | "PARADO" | "INATIVO";
  currentDriverId?: string;
  currentDriver?: User;
  totalKm: number;
  acquisitionDate?: string;
  lastMaintenanceDate?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  tires?: Tire[];
}

export interface Tire {
  id: string;
  code: string;
  brand: string;
  model: string;
  // Posição dinâmica: E1E, E1D, E2EE, E2DI, ESTEPE1, etc.
  position: string;
  status:
    | "NOVO"
    | "BOM"
    | "DESGASTADO"
    | "RECAPADO"
    | "SUBSTITUIDO"
    | "DESCARTADO";
  installationDate: string;
  initialKm: number;
  currentKm: number;
  cost: number;
  lifeExpectancyKm?: number;
  truckId: string;
  truck?: Truck;
  active: boolean;
  notes?: string;
  events?: TireEvent[];
}

export interface TireEvent {
  id: string;
  tireId: string;
  eventType:
    | "INSTALACAO"
    | "REMOCAO"
    | "ESTOURO"
    | "TROCA"
    | "RECAPAGEM"
    | "MANUTENCAO"
    | "DESGASTE";
  description: string;
  kmAtEvent: number;
  cost?: number;
  photoUrl?: string;
  createdAt: string;
}

export interface ChecklistPhoto {
  id: string;
  checklistId: string;
  category: "CABINE" | "LONA" | "PNEU" | "EIXO";
  axleNumber?: number;
  side?: "ESQ" | "DIR";
  photoUrl: string;
  notes?: string;
  createdAt: string;
}

export interface DailyChecklist {
  id: string;
  truckId: string;
  driverId: string;
  date: string;
  odometer?: number;
  overallCondition?: string;
  tiresCondition?: string;
  cabinCondition?: string;
  canvasCondition?: string;
  notes?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  cabinPhotoUrl?: string;
  tiresPhotoUrl?: string;
  canvasPhotoUrl?: string;
  truck?: Truck;
  driver?: User;
  createdAt: string;
  photos?: ChecklistPhoto[];
}

export type OccurrenceStatus =
  | "PENDENTE"
  | "EM_ANALISE"
  | "APROVADO"
  | "REJEITADO"
  | "RESOLVIDO";
export type OccurrenceType =
  | "PNEU_ESTOURADO"
  | "PROBLEMA_MECANICO"
  | "LONA_RASGADA"
  | "ACIDENTE"
  | "MANUTENCAO"
  | "OUTRO";
export type TireStatus =
  | "NOVO"
  | "BOM"
  | "DESGASTADO"
  | "RECAPADO"
  | "SUBSTITUIDO"
  | "DESCARTADO";
export type TruckStatus = "ATIVO" | "MANUTENCAO" | "PARADO" | "INATIVO";

export const OCCURRENCE_STATUS_LABELS: Record<OccurrenceStatus, string> = {
  PENDENTE: "Pendente",
  EM_ANALISE: "Em Análise",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
  RESOLVIDO: "Resolvido",
};

export const OCCURRENCE_TYPE_LABELS: Record<OccurrenceType, string> = {
  PNEU_ESTOURADO: "Pneu Estourado",
  PROBLEMA_MECANICO: "Problema Mecânico",
  LONA_RASGADA: "Lona Raçada",
  ACIDENTE: "Acidente",
  MANUTENCAO: "Manutenção",
  OUTRO: "Outro",
};

export const TIRE_STATUS_LABELS: Record<TireStatus, string> = {
  NOVO: "Novo",
  BOM: "Bom",
  DESGASTADO: "Desgastado",
  RECAPADO: "Recapado",
  SUBSTITUIDO: "Substituído",
  DESCARTADO: "Descartado",
};

export const TRUCK_STATUS_LABELS: Record<TruckStatus, string> = {
  ATIVO: "Ativo",
  MANUTENCAO: "Em Manutenção",
  PARADO: "Parado",
  INATIVO: "Inativo",
};

export interface Occurrence {
  id: string;
  type: OccurrenceType;
  status: OccurrenceStatus;
  description: string;
  truckId: string;
  driverId: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  photoUrls: string[];
  estimatedCost?: number;
  actualCost?: number;
  hasFinancialImpact: boolean;
  resolutionNotes?: string;
  occurredAt: string;
  resolvedAt?: string;
  truck?: Truck;
  driver?: User;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  occurrenceId?: string;
  occurrence?: Occurrence;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface AdminNotification {
  userNotificationId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface TireStatistics {
  totalTires: number;
  totalCost: number;
  averageLifeKm: number;
  totalEvents: number;
}
